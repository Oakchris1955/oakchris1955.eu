---
title: "Cryptocurrencies: a failed prophecy"
date: 2025-09-05T13:18:44.000Z
---

> *Once upon a time, a [prophet](https://en.wikipedia.org/wiki/Satoshi_Nakamoto) appeared into the world.*
>\
*They spoke of a [LEGEND](<https://bitcoin.org/bitcoin.pdf>)...*
>\
*A future founded on 3 pillars.*
>\
*Decentralization,*
>\
*Security,*
>\
*Scalability.*
>
>
> \- A bad attempt at paraphrasing the [Legend of Delta Rune](https://deltarune.wiki/w/Legend_of_Delta_Rune)

Cryptocurrencies. We know them. Some of us love them, others not that much.
They offer a way to make transactions between 2 individuals securely<sup>[citation needed]</sup>,
without relying on any central system<sup>[citation needed]</sup>,
while at the same time being scalable<sup>[citation needed]</sup>.

## (De)centralization

The first cryptocurrent, Bitcoin, was created with the intent of not having to
rely on any central entity/authority, instead relying on miners to ensure the
authenticity and secure of the transactions. In exchange, the miner that is lucky
enough to have mined a block gets newly minted Bitcoin and all the block's transaction fees.
However, since there are probably thousands of miners out there and only 1 block
can be mined on average every 10 minutes, they quickly started forming pools,
where the mining reward is split among the members of a pool if that pool
happens to mine a block. We can see that for the better part of the last 3 years,
[only 3 mining pools](https://mempool.space/graphs/mining/pools) have mined over
half of all Bitcoin blocks, with the top 5 mining more than three quarters of all
of them. This, alongside the fact that exchanges hold up to
[10%](https://www.binance.com/en/square/post/16057438709826) of all mined Bitcoin,
and also taking into account, Satoshi has about
[5%](https://bitslog.com/2013/04/24/satoshi-s-fortune-a-more-accurate-figure/),
and I am sure that at least the majority of Bitcoin that haven't moved since 2015
can be considered lost, which worsens the situation, since the more Bitcoin we
consider lost, the more value all the others get, and thus the more the power of
exchanges increases. Oh, and 0.01% of Bitcoin addresses control more than half
of all the Bitcoin supply (active or dormant)
(source: <https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2021.730122/full>).

## Secure? It depends

Blockchains themselves can be considered secure, since they are cryptographically
tied to each other with a secure hashing algorithm. Bitcoin uses two SHA-256, making
it virtually tamperproof. However, there are other kinds of security issues with
cryptocurrencies.

### The power of consensus

A blockchain is actually a huge graph of blocks that yes, are tied to each other
cryptographically, but it is up to the network to choose which chain is considered
to be "the blockchain" (that's why transactions that have made their way into a
mined blocked are sometimes considered to be unconfirmed until they are enough
blocks deep into the chain). This can cause forks in the blockchain, either
by accident or intentionally. Of the second kind, most of them are normally because
of disagreement within the community, leading to situations like Bitcoin Cash.
There are and some more controversial takes, such as The DAO, which was supposed
to be a DeFi thing, but because it wasn't properly written, a malovalent actor got
their hand on a big part of the Ethereum supply. In the end, a hard-fork was made,
which means that the Ethereum client code [was altered](https://github.com/ethereum/go-ethereum/pull/2814)
to revert the state of the blockchain. This action remains to this day pretty
controversial, while it also raises questions about the supposed immutability
of cryptocurrency blockchains.

### Immutability you say?

Because the blockchain is treated as immutable, at least when the big fish say
that it is, it is possible to lose your entire stash of crypto by sending it
into an inaccesible (random) address, essentially freezing/burning that amount.
If that happens by accident to you, there's nothing you can do. In the normal
world, you could contact you bank and maybe they would recompense you, but with
cryptocurrencies YOU are the bank, so it is your fault if all your money is lost.

### 51% attack

51% attacks happen when a single actor has at least 50% of the mining power in
a network. That power can then be used for things like blocking new transactions
or double-spending (also known as money-printing). Monero just recently
[faced](https://www.web3isgoinggreat.com/?id=monero-51-attack)
such an attack, where apparently 6 blocks were reordered, indicating that Qubic,
the entity behind the incident, has established significant control over the Monero network.

## Scalability

Visa says they process
[80 billion](https://corporate.visa.com/content/dam/VCOM/download/corporate/media/visanet-technology/visa-net-booklet.pdf)
transactions annually, or about 2.5 thousand every second. Bitcoin on the
other hand can do [3 to 7](https://www.comp.nus.edu.sg/~prateeks/papers/Bitcoin-scaling.pdf),
almost a thousand times less transactions. Cryptocurrencies are limited by their
block size, and that issue is what changes like SegWit tried to solve without
much success. So-called layer-2 networks try to solve this issue, with the most
prominent one being the Bitcoin Lightning Network, but yet even that has its own
issues, like needing at least 2 in-chain transactions for each 2-person channel,
as well as having to put a fixed amount of Bitcoin in that channel which then moves
back and forth. Tell me, how useful would that be in the real world where annually
we also people exchange money with hundreds of legal entities, usually 1-way?

## Waste of power

Bitcoin uses a proof-of-work (PoW) algorithm to ensure the security of its block.
Simply put, everyone tries to guess a correct random number while wasting as much
electricity as [possible](https://archive.ph/HRRaX).
As of September 2025, the Bitcoin network consumes as much electricity as a small country
for no actual good reason. Ethereum was on a
[similar pace](https://www.statista.com/statistics/1265897/worldwide-ethereum-energy-consumption/)
with Bitcoin, but since they switched to a new proof-of-stake (PoS) algorithm,
their energy consumption in almost zero. Why doesn't Bitcoin do that and instead
it keeps wasting electricity, a precious good during our times, for a network that
processes 7 transactions per second?

## Tied to nothing

Bitcoin (and most cryptocurrencies for that matter) have a floating exchange rate,
that means they are tied to nothing. The value of cryptocurrencies is dependent
on the mood of the market, since there is no actual demand for most of them and
their exchange market is based purely on speculation, just like NFTs. On that note,
cryptocurrencies are also
[pretty](https://www.web3isgoinggreat.com/?id=elon-musk-tweeting-dog-photo-somehow-pumps-memecoin)
[prone](https://www.web3isgoinggreat.com/?id=milei-memecoin-promotion)
[to](https://www.web3isgoinggreat.com/?id=melania-trump-launches-a-memecoin)
[manipulation](https://www.web3isgoinggreat.com/?id=trump-launches-a-shitcoin)

## It didn't have to be like this

Satoshi vision was of a scalable decentralized network where people could exchange
money securely and anonymously. Whether or not that is possible or not is not
relevant. What matters is that, 16 years latet, Bitcoin and cryptocurrencies in
general have not fulfilled even one of these promises. Yet, it is treated as a
means to lander money, obfuscate criminal activities and print money (see Tether).
Whether cryptocurrencies will stay as they are, disappear for good or go mainstream,
only time will tell. Nevertheless, the prophecy doesn't seem to be fulfilled any
time soon.
