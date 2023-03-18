# Just F\*cking Ship It!

A set of utilities and functions that I consistently used everytime I build a new application for the [12 startups challenge](https://justindra.com/tags/12-startups/). The idea here is to package up these functions to help me ship my ideas a lot faster and thought this might be helpful for others that want to do the same.

This is all built to support the tech stack that I've used consistently.

- [SST](https://sst.dev)
- [Astro](https://astro.build)
- [ElectroDB](https://electrodb.dev/)
- [React](https://reactjs.org/)
- [Tailwind](https://tailwindcss.com/)

Here are the projects that uses this package and where I've repeated some of these patterns:

- [festack](https://festack.co)
- [OneEPK](https://oneepk.com)
- [Egami](https://egami.io)
- [ifoundthis](https://ifoundthis.co/)
- [MFM Agreement](https://mfm.justindra.com/)
- [Buddy](https://withbuddy.com.au) - in progress

## Installation

Simply install the package

```
pnpm add jfsi
```

## Usage

To use it, import what you require.

```ts
import { NotFoundException } from 'jfsi/node/errors';

throw new NotFoundException('Cannot find item X...');
```

## Other Tech Stack

Here are the other technologies that I prefer to use at this time. If you need something and don't want to waste time thinking about it, this is a great start.

| JTD\*             | Tool                                 |
| ----------------- | ------------------------------------ |
| Analytics         | [Plausible](https://plausible.io/)   |
| Payment Processor | [Stripe](https://stripe.com/)        |
| Email Delivery    | [Postmark](https://postmarkapp.com/) |
| Customer Support  | [Plain](https://plain.com/)          |

> \*JTD - Jobs to be done
