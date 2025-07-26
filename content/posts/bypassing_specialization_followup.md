---
title: "\"Bypassing\" specialization in Rust...: Follow-up"
date: 2025-07-26T14:51:14+0300
---

This is a follow-up to [my previous article](/posts/bypassing_specialization)

## The issue

The method described in that article has a flow. Take the following example:

```rust
use simple_fatfs::*;

fn main() {
    // we don't care about the storage implementation, just keep in mind that
    // it implements all of the Read, Write & Seek trait
    let mut rw_storage = ...;

    let fs = FileSystem::from_ro_storage(&mut rw_storage).unwrap();

    let file = fs.get_ro_file(/* Path goes here */).unwrap();
}
```

Everything seems alright until we try to get that file using the `get_rw_file` method.
Since `rw_storage` implements `Read`, `Write` & `Seek`, we can call the `get_rw_file` method
as if everything is fine. In that case, we can modify and write to the `RWFile`, but after we `Drop`
it, those data we have modified won't be synced back to the filesystem, since the `sync_fn` field will be `None`

## The solution

Instead of using 2 constructors, one for a RO filesystem and another for a R/W filesystem, we use one for both cases.
We also keep the `sync_fn` and other similar fields and upon initialization we set them to `None`. We then need to modify
our `Write`-related functions so that each time after a `Write`-related operation has occured, they set the `sync_fn` and
the other related fields to `Some` value containing the function pointer to the sync function.

That's how our code should look like with that in mind:

```rust
struct FileSystem<S> where S: Read + Seek {
    // we got some fields here...

    storage: S
    sync_fn: Option<SyncFn>

    // ...and some more there
};

impl<S> FileSystem<S> where S: Read + Seek {
    pub fn from_storage(storage: S) -> Self {
        // code, lot's of code

        Self {
            storage: S,
            sync_fn: None
        }
    }
}

impl<S> FileSystem<S> where S: Read + Write + Seek {
    fn set_modified(&mut self) {
        self.sync_fn = Some(Self::sync_sector);
    }

    fn sync_sector(&mut self) {
        // implementation doesn't matter here
    }
}

impl<S> FileSystem<S> where S: Read  + Seek {
    pub fn get_ro_file(&mut self) -> ROFile {
        // code, a lot of code

        rofile
    }
}

impl<S> FileSystem<S> where S: Read + Write + Seek {
    pub fn get_rw_file(&mut self) -> RWFile {
        // code, a lot of code

        rwfile
    }

    pub fn create_file(&mut self) -> Result<RWFile, Error> {
        // code, a lot of code

        self.set_modified();

        created_file
    }
}
```

## Why did it take me a while to stumble upon this?

Not enough testing. That's the answer.

Even though I have loads of unit tests that are run by a CI each time I push something to Github, I didn't have
one for this particular case. In fact, now that I have finally finished with most of the `Write`-related stuff, testing
is an area of my crate that I feel like it need some serious changes.

Today's lesson: no number of unit tests is enough.
