# Table actions

Simple & customizable table with search, sort, pagination and checkbox functions in vanilla JS

## Development

Docker container running lite-server and watching code changes

```bash
make watch
```

Results can be tested in demos:

- http://localhost:3000/demo/html-data-table.html
- http://localhost:3000/demo/json-data-table.html

## Generate bundle

Local bundle pack with project name and actual project version in root folder

```bash
make bundle
```

## Run tests

Execute all tests suites of root `/tests` folder

```bash
make test
```

## More

To see all make commands

```bash
make help
```

## Installation

```bash
yarn add table-actions
```

Or directly in the HTML file

```html
<!-- Add to head HTML tag -->
<link rel="stylesheet" href="./css/table-actions.min.css" />
<!-- Add to the bottom of body HTML tag -->
<script src="./dist/table-actions.js"></script>

<!-- or directly from unpkg -->
<link
  rel="stylesheet"
  href="https://unpkg.com/table-actions@lastest/css/table-actions.min.css"
/>
<script src="https://unpkg.com/table-actions@latest/dist/table-actions.min.js"></script>
```

## Run

```js
// Utils library functions: toNormalForm and newElement can be imported here
import { TableActions } from "table-actions";

const table = new TableActions("elementOrQuerySelector", {
  /* options */
}); // only this line when included with script HTML tag
```

## Features

- Checkable columns with callback function to interact with selected elements
- Paginate
- Sortable columns
- Sort by date
- Theme light and dark
- Mobile theme options full responsive
- Search field
- Populate table with json data (example: demo/json-data-table.html)

## Roadmap

- API request data to populate Table

## References

### Theme and mobile reference

- [Responsive and sortable tables](https://codepen.io/mlegakis/pen/jBYPGr)
