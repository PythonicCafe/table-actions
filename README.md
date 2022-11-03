# Table actions

Simple & customizable table with search, sort, pagination and checkbox functions in vanilla JS

## Development
Docker container running lite-server and watching code changes

```bash
make watch
```

Results can be tested in http://localhost:3000/ and http://localhost:3000/example-json.html

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

## Features

- Checkable columns with callback function to interact with selected elements
- Paginate
- Sortable columns
- Sort by date
- Theme light and dark
- Mobile theme options full responsive
- Search field
- Populate table with json data (see example-json)

## Roadmap

- API request data to populate Table

## References

### Theme and mobile reference

- [Responsive and sortable tables](https://codepen.io/mlegakis/pen/jBYPGr)
