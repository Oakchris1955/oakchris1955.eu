---
title: "\"Bypassing\" specialization Rust or How I Learned to Stop Worrying and Love Function Pointers"
date: 2025-07-13T16:28:18+0300
---

I've spent nearly a year developing and refining my own FAT driver in Rust. For much of the last six months, I had to put the project on hold due to school commitments. However, I'm back now, especially since this project has become my most-starred repository on GitHub. During that journey, I (almost) learned how FAT and filesystems in general work behind-the-scenes and in my attempts to navigate the constraints imposed by the Rust programming language, I encountered what I thought was an immovable obstacle: **specialization**

## A quick word about specialization

Specialization as a concept was introduced with [RFC 1210](https://github.com/rust-lang/rfcs/pull/1210) all the way back to 2015, long before I even had a serious passion about computers and programming. For our use case, specialization allows us to essentially override trait and struct `impl`s. Let me demonstrate with an example:

```rust
trait A {}
trait B {}

struct MyStruct<S>(S) where S: A;

impl<S> MyStruct<S> where S: A {
    fn do_something(&self) {
        // do something here
    }
}


impl<S> MyStruct<S> where S: A + B {
    fn do_something(&self) {
        // do something else here
    }
}
```

In Rust, the above code wouldn't compile, since we define the function `do_something` twice. With specialization, the compiler would realize that the second `impl` is more "specialized" than the first one and the above code would compile just fine. Then, if we constructed the struct `MyStruct` with its only field containing an object that implements trait `A` but not trait `B`, then we did the same but with an object that now implements both `A` and `B`, and called the `do_something` method on each one struct, the first `do_something` implementation and second `do_something` implementation would be run respectively. Cool, so why do the above code not compile? Well, I am not an expert in Rust soundness and safety, but according to the tracking issue ([#31844](https://github.com/rust-lang/rust/issues/31844)) and some Zulip chats and Rust user forum threads I've found, there's a lifetime-related issue with the whole feature that no one knows how to easily solve. There's another feature, `min-specialization` which seems to not suffer from that problem to the same extent, but its still unstable, and since I don't wanna deal with safety issues and I also would like my project to be on the stable toolchain, that won't suit us.

## Why do we need specialization anyways?

That's a good question. It all comes down to how I've come to choose to communicate with the storage device. FAT filesystems are subdivided to sectors, where each sector stores a fixed amount of data, which can be either 512, 1024, 2048 or 4096 bytes (there are also clusters, which are subdivisions of file data and whose size is an integer multiple of the sector size, but we don't care about clusters right now because of what you are gonna read below). Each time we want to read or modify a certain piece of data, we load that sector to a sector buffer, which is just an array, we read our data from the buffer or directly modify them there, and when we want to load another sector, we first sync the buffer back to the filesystem if there are any changes. The issue might not be apparent right now, but it will be in a bit.

To implement a `FileSystem` struct that can be either Read-Only or Read/Write, we should define read-related methods in `impl` blocks that require the storage to support `Read` and `Seek`. `Write`-related methods should be defined in blocks that require `Read`, `Write`, and `Seek`. Let's take a look into our hypothetical function to loads the corresponding sector into the sector buffer.

```rust
// struct is defined above

impl<S> FileSystem<S> where S: Read + Seek {
    fn load_nth_sector(&mut self) -> Result<(), S::Error> {
        // our logic goes here
    }
}
```

Any functions that performs any kind of read and write function would call this to make sure that the correct sector is in the sector buffer. But this function is within a `Read` + `Seek` `impl` block, which means that it can't write to the storage and thus any changes to the sector buffer are never synced back to the storage medium. With specialization we would be able to do the following, which we can't, since specialization as of writing this is an unstable feature:

```rust
// struct is defined above

impl<S> FileSystem<S> where S: Read + Seek {
    fn load_nth_sector(&mut self) -> Result<(), S::Error> {
        // our read-only logic goes here
    }
}

impl<S> FileSystem<S> where S: Read + Write + Seek {
    fn load_nth_sector(&mut self) -> Result<(), S::Error> {
        // our read-only logic goes here
    }
}
```

Of course Rust complains that the `load_nth_sector` function is defined twice and thus the code above fails to compile.

After procrastinating for quite some time due to this very issue, I then decided to try solving it.

## Attempt #1: Check if someone else has "implemented" specialization with a macro of some kind

I eventually stepped upon [`spez`](https://crates.io/crates/spez) (spez stands for specialization if it isn't obvious), which is a crate that "implements *auto(de)ref specialization*: A trick to do specialization in non-generic contexts on stable Rust". From the crate page it seemed like exactly what I wanted, so I immediately added it to my crate and wrote my code around it. Had I paid attention to section "In a generic function", as well as in the beginning of the second section "What it can and cannot do", I would have noticed the following: "The auto(de)ref technique—and therefore this macro—is useless in generic functions, as Rust resolves the specialization based on the bounds defined on the generic context, not based on the actual type when instantiated.". After that, I dumped the crate, although I found the technique it uses pretty fascinating, even if it doesn't fit in my use case.

## Attempt #2: Generic enum and PhantonData

That might be one of the most stupid ideas I've ever had. I will let the code speak for itself:

```rust
enum StorageEnum<RO, RW, E>
where
    RO: Read<Error = E> + Seek<Error = E>,
    RW: Read<Error = E> + Write<Error = E> + Seek<Error = E>,
{
    ReadOnly(RO),
    ReadWrite(RW),
}

impl<RO, RW, E> StorageEnum<RO, RW, E>
where
    RO: Read<Error = E> + Seek<Error = E>,
    RW: Read<Error = E> + Write<Error = E> + Seek<Error = E>,
{
    fn get_ro(&self) -> &dyn ReadOnly<E> {
        match self {
            Self::ReadOnly(ro) => ro,
            Self::ReadWrite(rw) => rw,
        }
    }

    fn get_rw(&self) -> Option<&dyn ReadWrite<E>> {
        match self {
            Self::ReadOnly(_ro) => None,
            Self::ReadWrite(rw) => Some(rw),
        }
    }
}
```

The whole idea was to have two separate constructors (like now) and store the enum on a field of the `FileSystem` struct. The struct's methods would call `get_ro` and `get_rw` respectively depending on whether their action read or writes data back to the storage. A `PhantomData` field would the ensure that only the correct `impl`s would be visible to the end user, depending on whether their storage is Read-Only or Read/Write (by the way `PhantomData` has to be one of the most amazing features of the Rust Programming Language).

The issue with the code above is that those generics must also be passed to the `FileSystem` struct, even though that is supposed to be a hacky solution that the user should have no knowledge of. Furthermore, soon I started encountering lifetime-related issues, so I decided to give up on that solution too. I was about to give up on trying to hack my way around specialization and start polishing other stuff within my crate.

And then I remembered that Rust has a `Fn` trait.

## Pointers, pointers everywhere

I started implementing my solution on a trait-orientated basis but then I switched to function pointers (`fn`, not `Fn`) because they didn't need to be wrapped within a `Box` and because they also solved me some lifetime-related issues I encountered. As of writing this [I have pushed the code to Github](https://github.com/Oakchris1955/simple-fatfs/commit/d2490ec65b2d93848699ad94e4c9599e93165ece), but nevertheless here's a (rough) summary of my solution:

```rust
trait Read { /* trait declaration */ }
trait Write { /* trait declaration */ }
trait Seek { /* trait declaration */ }

type SyncFn = fn(&mut self) -> Result<(), S::Error>;

struct FileSystem<S> where S: Read + Seek {
    // we got some fields here...

    storage: S
    sync_fn: Option<SyncFn>

    // ...and some more there
};

impl<S> FileSystem<S> where S: Read + Seek {
    pub fn from_ro_storage(storage: S) -> Self {
        // code, lot's of code

        Self {
            storage: S,
            sync_fn: None
        }
    }
}

impl<S> MyStruFileSystemct<S> where S: Read + Write + Seek {
    pub fn from_rw_storage(storage: S) -> Self {
        // code, a lot of code

        Self {
            storage: S,
            sync_fn: Self::sync_current_sector as SyncFn
        }
    }
}

impl<S> FileSystem<S> where S: Read + Seek {
    fn load_nth_sector(&mut self) -> Result<(), ...> {
        // we do some stuff here

        if let Some(sync_fn) = self.sync_fn {
            sync_fn(self)
        }

        // once we are done with that, we do some more stuff
    }
}
```

Alright, you might be asking what's going on. The answer is pretty simple. We have two constructors, as intended, one for a RO filesystem and another one for a R/W filesystem. Both constructors call roughly the same code (in fact I use a macro, `akin`, that essentially duplicates a single `impl` block that I don't have to deal with duplicate code) but when they construct the FileSystem struct, the RO FileSystem constructor passes `None` to a struct field that takes an `Option` with a function pointer, while in the second case we pass a `Some` value containing a pointer to a function that is only accessible from this scope. Then, on the function that we want to specialize, `load_nth_sector`, we match that field and if it contains a function pointer, which we expect to be the function that syncs the sector buffer with the storage medium, we call it. That way, we have just "emulated" specialization.

I am well aware that this won't fit every possible use case, but I am pretty confident that some of you out there might at least land on this blog post and not spend as much time as I did trying to solve your issue.

## Is specialization as a feature really necessary then?

Yes.

My solution to my issue is not only pretty specific to my use case, but it also introduces additional overhead to the struct, both when it comes to performance (every time the `load_nth_sector` function is called and the sector buffer is modified, Rust must match that very field, even though its value doesn't change at all from the FileSystem's construction until it is dropped. It is very possible that Rust compiler notices this and removes the additional overhead, but in such cases it is good to be pesimistic), as well as when it comes to memory (these function pointers take up some memory, although considering they are just pointers I wouldn't worry about it that much). Furthermore, my solution is pretty sloppy and I would say even annoying to implement in certain cases. In my example above I only wanted to specialize one function, but what in reality I also want to specialize another one function. Now imagine trying to do that for 5 or 10 more function, and you will soon realize that this solution, while it solves the problem, it is just too hacky. Lastly, the unstable `specialization` feature also deals with lifetimes, which as I mentioned is the feature's biggest obstacle on the way to stabilization.

Ending this article, I would like to say that while my solution may work for specific cases, I recommend using specialization once it is stabilized, as it will definitely be more efficient and cleaner than what I've done here.
