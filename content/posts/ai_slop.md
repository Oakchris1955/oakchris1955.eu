---
title: "I opened a PR on a vibe-coded project. The owner asked me to implement additional features"
date: 2026-04-09T17:12:45+0300
---

I was browsing Hacker News a month ago when a stumbled upon a [post](https://news.ycombinator.com/item?id=47194679) that drew my attention.
I went into the project's [repository](https://github.com/Higangssh/gitcredits), noticed that there was a feature which I deemed as necessary for this project missing, so I forked the repository, implemented it myself, and opened a pull request. When the project's owner answered to my PR, the language they used was clearly LLM-like and I got asked to implement 4 additional features.

## About the project itself

I didn't realize it until after I had made my pull request, but the project's README (and the project as a whole) was what I would expected from an AI-generated project:

- Prebuilt binaries for a project that can be installed using `go install` (that method is listed in the README, but I just can't understand why such a project would need prebuilt binaries), including a quick install script
- Pretty liberal usage of [em-dashes](https://en.wikipedia.org/wiki/Dash#Usage_in_AI-generated_text) (—)
- Lots of [randomly-bolded](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Overuse_of_boldface) text
- The README's section order doesn't make much sense. First is the "Install" section, followed by "Usage", then "What it shows" and lastly, "Requirements" and "License". I honestly don't know why an AI would choose to put them in that order: who would I want to first see the installation instructions, and then the project's requirements .I personally would have placed the "What it shows" section first, then the "Requirements" followed by "Install" and "Usage", and lastly the "License" section.

The project's scope is to "Turn your contributors into movie stars", that is, by using `git` (and Github's CLI tool, `gh`), to generate fancy, movie-like credits for your project. You run it in the target directory and it prints the credits in your terminal. I was kinda surprised that there wasn't a CLI argument for targetting other directories (imagine if each time we had to run `ls` we had to be at the target directory), so I forked the repository, as I've already written, made my changes and opened a [pull request](https://github.com/Higangssh/gitcredits/pull/2).

### Issues I met

I did have 2 issues while making my changes: The first was with the argument parsing, which I already explained below what the issue with that was, and the second what to do with the GIF generation. `gitcredits` has an option to save the credits as a GIF, but the way it approaches it is awful. Under the hood, it invokes [`vhs`](https://github.com/charmbracelet/vhs), which is "a tool for generating terminal GIFs from code", it runs itself AGAIN with a `--theme` argument (which allows you to have references to Spiderman or Matrix in your credits). That means that if someone adds another CLI flag argument (or positional argument, in my case), they have to also modify that code accordingly .Passing the original arguments as-in is out of the question, since the `--output` will also get passed, the invoked executable will invoke `vhs` too and it will enter an infinite spiral of program invokation (in my case, the first program terminated after 5 minutes or so. I don't know if it is due to `vhs` imposing a timeout for such cases or because a `gitcredits` instace happened to crash).

### "Before I can merge this, I’d like to request a few changes"

After the first time I closed the pull request (I was having a bit too much fun with branches on the forked repository), the project's owner [replied](https://github.com/Higangssh/gitcredits/pull/2#issuecomment-4199376109) and asked me to do the following before they could merge my branch onto the repository:

1) "avoid using os.Chdir() inside getRepoInfo()" - On my behalf, I probably should have used filepath.Join, but that is a change they could have done themselves in 5 minutes
2) "make the directory a properly parsed positional argument" because "The current parsing logic is fragile" - For reference, here's what that parsing logic looked like when I began:

   ```go
   // parse flags
   theme := "default"
   output := ""
   for i, arg := range os.Args[1:] {
       if arg == "--version" || arg == "-v" {
           fmt.Printf("gitcredits %s (%s)\n", version, commit)
           os.Exit(0)
       }
       if arg == "--help" || arg == "-h" {
           fmt.Println("gitcredits - Turn your Git repo into movie-style rolling credits")
           fmt.Println()
           fmt.Printf("Usage: gitcredits [options]\n\n")
           fmt.Println("Options:")
           fmt.Println("  --theme <name>   Theme: default, matrix, spiderman")
           fmt.Println("  --output <file>  Export credits as GIF")
           fmt.Println("  --version, -v    Show version")
           fmt.Println("  --help, -h       Show this help")
           os.Exit(0)
       }
       if arg == "--theme" && i+1 < len(os.Args[1:]) {
           theme = os.Args[i+2]
       }
       if arg == "--output" && i+1 < len(os.Args[1:]) {
           output = os.Args[i+2]
       }
   }
   ```

   All I did was build upon this code (you can see the relevant [changes](https://github.com/Higangssh/gitcredits/pull/2/changes#diff-2873f79a86c0d8b3335cd7731b0ecf7dd4301eb19a82ef7a1cba7589b5252261R21-R55)), that is, extend on the already-fragile parsing logic because that's what I got to work with. I am not going to refactor all that logic for my small change.
3) "return errors instead of calling `os.Exit(1)` inside helper functions" - I already had found two occurrences of that practice [here](https://github.com/Higangssh/gitcredits/blob/29860ca989dbe415c863cb85812358c49abd3544/main.go#L63) and [here](https://github.com/Higangssh/gitcredits/blob/29860ca989dbe415c863cb85812358c49abd3544/main.go#L112). Again, as with the previous request, I was following practices that already existed in the codebase.
4) "Please add tests for the new behavior" - I deemed these tests unnecessary for such a small change on such a small project.

[I did answer](https://github.com/Higangssh/gitcredits/pull/2#issuecomment-4199432571) their requests, of which number 2 and number 3 seemed absurd to me. The project's author replied that "this started as a small utility project", and that they "did not pay enough attention to code quality early on, so some of these patterns do exist in the current codebase" and that they "want to raise the bar going forward rather than add more of the same patterns", after which they reiterated the same claims and saying that if I "want to update the PR in that direction," they are "happy to review it again". I then closed the PR and detached my fork from the parent repository. From what [I've seen](https://github.com/Higangssh/gitcredits/commit/e5574645d3a7618f9bc7d67bf83270f160ad7c0f), they implemented my changes themselves.

Unfortunately, that isn't the first time I've had to deal with nonsensical LLM-generated text.

## Wikipedia: LLMs are not welcome

Wikipedia recently adopted a strict no-LLM policy after a [RFC](https://en.wikipedia.org/wiki/Wikipedia:Writing_articles_with_large_language_models/RfC), but even before that, AI-slop wasn't welcome on Wikipedia.

I myself joined Wikipedia [last November](https://en.wikipedia.org/w/index.php?title=Special:Log&logid=173804982), and while I haven't been able to contribute as much as I'd like to due to the intensive studying I've been doing this year (hence the reason why my last post is from September 2025), I've been trying to contribute however I can in my free time, since I believe that is more beneficial both for me and for the greater good than doomscrolling. From when I joined until now, I have spotted a grand total of two articles heavily impacted by LLM editing: one nonsensical article and one attempted LLM rewrite of another one.

### The case of the Washington–Moscow–Berlin Axis

As of the writing of this article, if you take a look at my [talk page](https://en.wikipedia.org/wiki/User_talk:Oakchris1955) on Wikipedia, you may notice a comment from a user called "Africamatters", about their "Newest article (Washington–Moscow–Berlin Axis)". That article was the first (and currently only) article for which I started an AfD (Articles for Deletion) discussion.

This article first came to my attention in an attempt to find the [German-Soviet Axis](https://en.wikipedia.org/wiki/German%E2%80%93Soviet_Axis_talks) page or something similar by typing something along those lines on Wikipedia's search bar, when an article titled "Washington–Moscow–Berlin Axis" appeared. Upon clicking it, I was almost certain that it was the result of LLM hallucinations (the article has since been deleted but can be found in the Wayback Machine [here](https://web.archive.org/web/20251223160754/https://en.wikipedia.org/w/index.php?title=Washington%E2%80%93Moscow%E2%80%93Berlin_Axis)). You can check my findings on the [AfD proposal](https://en.wikipedia.org/wiki/Wikipedia:Articles_for_deletion/Washington%E2%80%93Moscow%E2%80%93Berlin_Axis), from which it is apparent (as other users said), that the article is "entirely made up nonsense" (two speedt deletes) and that the article author's "prose is significantly different from the prose that existed in the article when they created it. The simplest explanation is that the article was created with an LLM".

### Slavery in Africa

When I stumbled upon that article, I found it in a [pretty bad shape](https://en.wikipedia.org/w/index.php?title=Slavery_in_Africa&oldid=1345534852): all headings were [heavily capitalized](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Title_case), in some areas of the article there was [bolding](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Overuse_of_boldface) for no good reason, there were issues with named references and incorrect ISBNs, etc. At the time, I didn't have the time to clean up the article, so I just [added](https://en.wikipedia.org/w/index.php?title=Slavery_in_Africa&oldid=1345645617) a template to mark the article as needing cleanup. I didn't have the time to take further action, since another editor reverted the edits with the LLM-generated text, one of which was a +1k character [addition](https://en.wikipedia.org/w/index.php?title=Slavery_in_Africa&oldid=1345534133) within the span of 6 minutes from a previous edit, from a mobile device (I myself can't write 1k characters within 6 minutes on a mobile device. If you do, please let me know how, I'd love to know how to do it).

## Bottom line

I keep hearing about the supposed advantages of artificial intelligence: that no one will write real code, that we won't need doctors, that it will cause an economic boom, that...

In reality, dealing with AI-slop is wasting people's time. Apart from my case with `gitcredits`, there seems to be quite an issue on Wikipedia, otherwise I don't imagine there would have been all this hastle with the RfC banning LLM-generated content. AI is [misleading people](https://arstechnica.com/google/2026/04/analysis-finds-google-ai-overviews-is-wrong-10-percent-of-the-time/), [killing children in coordinated strikes](https://www.theguardian.com/news/2026/mar/26/ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-far-more-worrying) and [making RAM almost unaffordable](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage), just to name a few.

I have seen what AI (not LLMs) can do, especially in the machine learning field. I participated in my country's IOAI selection phase (I didn't make it to the international Olympiad, but I got in the top 25% of everyone in the last national selection phase) and they used some pretty good and interesting examples for what AI can do: diagnose breast cancer, recognize deepfakes, and all those with a fairly good correct prediction rate, considering the fact that all the models we run were trained on Google Colab and were publicly available.

AI is an amazing technology, perhaps the most amazing to come after the invention of the Internet. We must realize that it can much more things than vibe-coding and filling the Internet with slop, or we will miss its true potential.
