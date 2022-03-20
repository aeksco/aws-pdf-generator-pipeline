import * as fs from "fs";
import * as AWS from "aws-sdk";
const s3obj = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

// // // //

function createTmpFile(filename: string) {
  const content = "<h1>Generate Test PDF</h1>";
  fs.writeFileSync(filename, content);
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
  createTmpFile(localFilename);

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
