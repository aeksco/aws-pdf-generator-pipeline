import * as chromium from "chrome-aws-lambda";
import * as fs from "fs";
import * as AWS from "aws-sdk";
const s3obj = new AWS.S3();
const HTML_S3_BUCKET_NAME = process.env.HTML_S3_BUCKET_NAME || "";
const PDFS_S3_BUCKET_NAME = process.env.PDFS_S3_BUCKET_NAME || "";

// // // //

export const handler = async (
  event: any = {},
  context: any = {}
): Promise<any> => {
  // Log start message
  console.log("generate-pdf -> start");
  console.log(JSON.stringify(event, null, 4));

  // Pulls htmlFilename from event
  const htmlFilename = event["Records"][0]["s3"]["object"]["key"];
  const htmlFilepath: string = `/tmp/${htmlFilename}`;

  // Defines filename + path for downloaded HTML file
  const pdfFilename: string = htmlFilename.replace(".html", ".pdf");
  const pdfFilepath: string = `/tmp/${pdfFilename}`;

  // Defines URL to read htmlFilepath
  const fetchUrl: string = `file://${htmlFilepath}`;

  console.log(`htmlFilename: ${htmlFilename}`);
  console.log(`htmlFilepath: ${htmlFilepath}`);
  console.log(`pdfFilename: ${pdfFilename}`);
  console.log(`pdfFilepath: ${pdfFilepath}`);

  // Download HTML from S3 bucket to /tmp/
  await new Promise((resolve, reject) => {
    s3obj
      .getObject({
        Bucket: HTML_S3_BUCKET_NAME,
        Key: htmlFilename,
      })
      .send((err, data) => {
        console.log(err, data);
        // Logs error
        if (err) {
          console.log(`generate-pdf -> download HTML from s3 -> ERROR`);
          console.log(err);
          reject(err);
          return;
        }
        console.log(
          `generate-pdf -> download HTML from s3 -> SUCCESS --> ${htmlFilename}`
        );

        // Writes HTML to temp file
        fs.writeFileSync(htmlFilepath, data.Body);
        resolve(true);
      });
  });

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

    // Navigate to page, wait until dom content is loaded
    await page.goto(fetchUrl, {
      waitUntil: "domcontentloaded",
    });

    // Generate PDF from page in puppeteer
    await page.pdf({
      path: pdfFilepath,
      format: "A4",
      margin: {
        top: "20px",
        left: "20px",
        right: "20px",
        bottom: "20px",
      },
    });

    // Upload generated PDF to S3 bucket
    await new Promise((resolve, reject) => {
      s3obj
        .upload({
          Bucket: PDFS_S3_BUCKET_NAME,
          Key: pdfFilename,
          Body: fs.readFileSync(pdfFilepath),
        })
        .send((err, data) => {
          console.log(err, data);
          // Logs error
          if (err) {
            console.log(`generate-pdf -> upload to s3 -> ERROR`);
            console.log(err);
            reject(err);
            return;
          }
          console.log(
            `generate-pdf -> upload to s3 -> SUCCESS --> ${htmlFilepath}`
          );
          resolve(true);
        });
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
