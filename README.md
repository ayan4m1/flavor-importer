# ELR-ATF Flavor Importer

This utility helps you copy your flavor stash from ELR to ATF or vice-versa.

## Prerequisites

- [Node.JS](https://nodejs.org/en/)
- [Git for Windows](https://git-scm.com/download/win)

## ATF to ELR

1. Go [here](https://alltheflavors.com/my/backup/flavors.json). Save this file somewhere.
2. Copy the `flavors.json` you saved in step 1 into the `flavor-importer` directory.
3. Open a command prompt.
4. Run the following commands:

```
$ git clone git@github.com:ayan4m1/flavor-importer.git
$ cd flavor-importer
$ npm install
$ npm run build
$ node lib/index elr flavors.json
```

5. A Chrome window will open to ELR. Log in.
6. The program will redirect you to the flavor stash page and enter the first flavor from your list.
7. Select the correct flavor from the autocomplete dropdown. Do NOT click Add.
8. The program will add the flavor for you and continue by typing in the next flavor name.
9. Repeat steps 7-8 until complete.

## ELR to ATF

1. Go [here](https://e-liquid-recipes.com/stash). Click "Export to CSV."
2. Copy the `stash-export_{timestamp}.csv` you saved in step 1 into the `flavor-importer` directory.
3. Open a command prompt.
4. Run the following commands:

```
$ git clone git@github.com:ayan4m1/flavor-importer.git
$ cd flavor-importer
$ npm install
$ npm run build
$ node lib/index atf stash-export.csv
```

5. A Chrome window will open to ATF. Log in.
6. The program will redirect you to the flavor stash page and enter the first flavor from your list.
7. Click the check box next to the correct flavor in the results list. You can change what is in the text box if necessary to find the correct flavor.
8. The program will continue by typing in the next flavor name.
9. Repeat steps 7-8 until complete.
