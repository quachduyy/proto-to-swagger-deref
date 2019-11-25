#!/usr/bin/env node
const fs = require("fs");
const RefParser = require("json-schema-ref-parser");

// Read process agruments
// Sample cmd: swagger-deref <proto-file-path> --keep-def=true
const [, , ...args] = process.argv;

let keepReference = true;

args.forEach((item) => {
  if (typeof item === "string" && item.indexOf("--keep-ref=") !== -1) {
    const options = item.split("=");
    switch (options[1]) {
      case "true":
        keepReference = true;
        break;
      case "false":
        keepReference = false;
      default:
        break;
    }
  }
});

// Start processing Swagger JSON file
async function dereference(options) {
  let data = fs.readFileSync(args[0]);
  let derefData = null;
  try {
    data = JSON.parse(data);
  } catch (error) {
    console.error(`Cannot parse JSON from ${args[0]}`);
    process.exit(1);
  }
  console.log(JSON.stringify(data), "\n\n\n\n\n\n");
  try {
    derefData = await RefParser.dereference(data);
    console.log(JSON.stringify(derefData), "\n\n\n\n");
  } catch (error) {
    console.error("Error when dereference Swagger file", error);
    process.exit(1);
  }
  console.log(options);
  if (options.keepReference === false) {
    delete derefData.definitions;
  }
  console.log(JSON.stringify(derefData));
  if (derefData && typeof derefData === "object") {
    try {
      fs.writeFileSync(args[0], JSON.stringify(derefData));
    } catch (error) {
      console.error("Dereference Swagger file error:", error);
      process.exit(1);
    }
  }
  console.log("Dereference Swagger file success!");
}

dereference({ keepReference });
