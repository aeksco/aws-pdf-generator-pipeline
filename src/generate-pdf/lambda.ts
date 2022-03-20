import * as chromium from "chrome-aws-lambda";
import * as fs from "fs";
import * as AWS from "aws-sdk";
const s3obj = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
// import * as AWS from "aws-sdk";
// const db = new AWS.DynamoDB.DocumentClient();
// const TABLE_NAME = process.env.TABLE_NAME || "";
// const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

// // // //

function createTmpFile() {
  const content = `<h1>Generate Test PDF</h1>`;
  fs.writeFileSync("/tmp/test.html", content);
}

// // // //

export const handler = async (
  event: any = {},
  context: any = {}
): Promise<any> => {
  // Log start message
  console.log("generate-pdf -> start");
  console.log(event);

  // TODO - remove this
  createTmpFile();

  // Define
  let result = null;
  let browser = null;

  try {
    // Defines browser
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    // Defines page
    let page = await browser.newPage();

    // Gets fetchUrl for puppeteer
    // This is the page with all the PDF download URLs
    // const fetchUrl: string = buildFetchUrl();
    const filename: string = "test.html";
    const fetchUrl: string = `file:///tmp/${filename}`;

    // Navigate to page, wait until dom content is loaded
    await page.goto(fetchUrl, {
      waitUntil: "domcontentloaded",
    });

    // Generate PDF from page in puppeteer
    await page.pdf({
      path: "/tmp/test.pdf",
      format: "A4",
      margin: {
        top: "20px",
        left: "20px",
        right: "20px",
        bottom: "20px",
      },
    });

    // Upload generated PDF to S3 bucket
    s3obj
      .upload({
        Bucket: S3_BUCKET_NAME,
        Key: "test.pdf",
        Body: fs.readFileSync("/tmp/test.pdf"),
      })
      .send((err, data) => {
        console.log(err, data);
        // Logs error
        if (err) {
          console.log(`generate-pdf -> upload to s3 -> ERROR`);
          console.log(err);
          return;
        }
        console.log(`generate-pdf -> upload to s3 -> SUCCESS --> ${filename}`);
      });
  } catch (error) {
    return context.fail(error);
  } finally {
    // Close the puppeteer browser
    if (browser !== null) {
      await browser.close();
    }
  }

  // Logs "shutdown" statement
  console.log("generate-pdf -> shutdown");
  return context.succeed(result);
};
