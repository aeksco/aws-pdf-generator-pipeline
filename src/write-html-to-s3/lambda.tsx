import * as React from "react";
import * as fs from "fs";
import * as AWS from "aws-sdk";
import * as ReactDOMServer from "react-dom/server";
import { Component } from "./component";

const s3obj = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

// // // //

const indexFile = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
`;

function createHtmlFile(filename: string) {
  const app = ReactDOMServer.renderToString(<Component />);
  const html = indexFile.replace(
    '<div id="root"></div>',
    `<div id="root">${app}</div>`
  );

  fs.writeFileSync(filename, html);
}

// // // //

export const handler = async (
  event: any = {},
  context: any = {}
): Promise<any> => {
  // Log start message
  console.log("write-html-to-s3 -> start");
  console.log(event);

  // Generate a new html file
  const time = Number(new Date());
  const filename: string = `test-${time}.html`;
  const localFilename: string = `/tmp/${filename}`;
  createHtmlFile(localFilename);

  console.log(`Wrote local file: ${localFilename}`);

  try {
    // Upload generated HTML to S3 bucket
    await new Promise((resolve, reject) => {
      s3obj
        .upload({
          Bucket: S3_BUCKET_NAME,
          Key: filename,
          Body: fs.readFileSync(localFilename),
        })
        .send((err, data) => {
          console.log(`write-html-to-s3 -> upload to s3 -> send`);
          console.log(err, data);
          // Logs error
          if (err) {
            console.log(`write-html-to-s3 -> upload to s3 -> ERROR`);
            console.log(err);
            reject(err);
            return;
          }
          console.log(
            `write-html-to-s3 -> upload to s3 -> SUCCESS --> ${filename}`
          );
          resolve(true);
        });
    });
  } catch (error) {
    console.log(`write-html-to-s3 -> upload to s3 -> ERROR -> CATCH`);
    console.log(error);
    return context.fail(error);
  }

  // Logs "shutdown" statement
  console.log("write-html-to-s3 -> shutdown");
  return context.succeed();
};
