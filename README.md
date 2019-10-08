# ELR Flavor Importer

## Prerequisites

* [Node.JS](https://nodejs.org/en/)
* [Git for Windows](https://git-scm.com/download/win)

## Usage

1) Go [here](https://alltheflavors.com/my/backup/flavors.json). Save this file somewhere.
2) Open a command prompt.
3) Run the following commands:

```
$ git clone git@github.com:ayan4m1/elr-flavor-importer.git
$ cd elr-flavor-importer
$ npm install
$ npm start
```

4) Copy the `flavors.json` you saved in step 1 into the `elr-flavor-importer` directory.
5) A Chrome window will open to ELR. Accept the cookie warning and log in.
6) The program will redirect you to the flavor stash page and enter the first flavor from your list.
7) Select the correct flavor from the autocomplete dropdown. Do NOT click Add.
8) The program will add the flavor for you and continue by typing in the next flavor name.
9) Repeat steps 7-8 until complete.
