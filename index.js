var glob = require("glob");
var path = require("path");
const lineReader = require("line-reader");
var { writeToPath } = require("@fast-csv/format");

const cssProperty = /([-a-z]+):/;

let countByProperty = {};

function incrementProperty(property) {
  const prevCount = countByProperty[property] || 0;
  countByProperty[property] = prevCount + 1;
}

glob(`../project-folder/src/**/*.styles.+(tsx|ts)`, async (er, files) => {
  await Promise.all(
    files.map((file) => {
      return new Promise((resolve) => {
        lineReader.eachLine(
          file,
          (line) => {
            const match = line.match(cssProperty);
            if (match) {
              const property = match[1];
              incrementProperty(property);
            }
          },
          (err) => {
            if (err) throw err;
            resolve();
          }
        );
      });
    })
  );

  logPropertiesByCount();
});

function logPropertiesByCount() {
  const entries = Object.entries(countByProperty);
  entries.sort((a, b) => b[1] - a[1]);

  writeToPath(path.resolve(__dirname, "properties.csv"), entries)
    .on("error", (err) => console.error(err))
    .on("finish", () => console.log("Done writing."));
}
