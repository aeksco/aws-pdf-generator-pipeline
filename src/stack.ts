// import * as events from "@aws-cdk/aws-events";
// import * as dynamodb from "@aws-cdk/aws-dynamodb";
// import * as targets from "@aws-cdk/aws-events-targets";
// import * as iam from "@aws-cdk/aws-iam";
// import {
//   DynamoEventSource,
//   S3EventSource,
//   SnsEventSource,
// } from "@aws-cdk/aws-lambda-event-sources";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { RemovalPolicy } from "@aws-cdk/core";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";

// // // //

export class PdfGeneratorPipeline extends cdk.Stack {
  // constructor(app: cdk.App, id: string) {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // Provisions S3 bucket for HTML source files
    // Doc: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-readme.html#logging-configuration
    const htmlBucket: s3.Bucket = new s3.Bucket(
      this,
      "pdf-generator-input-bucket",
      {
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // Provisions S3 bucket for geneated PDFs
    // Doc: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-readme.html#logging-configuration
    const pdfsBucket: s3.Bucket = new s3.Bucket(
      this,
      "pdf-generator-output-bucket",
      {
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // // // //
    // // // //

    // // // //
    // Provisions send-pdf-to-textract lambda

    // // sendPdfToTextract Lambda
    // const sendPdfToTextract = new lambda.Function(
    //   this,
    //   "sendPdfToTextractFunction",
    //   {
    //     code: new lambda.AssetCode("src/send-pdf-to-textract"),
    //     handler: "lambda.handler",
    //     runtime: lambda.Runtime.NODEJS_10_X,
    //     environment: {
    //       TABLE_NAME: parsedPdfDataTable.tableName,
    //       PRIMARY_KEY: "itemId",
    //       S3_BUCKET_NAME: downloadsBucket.bucketName,
    //     }
    //   }
    // );

    // // Configure event source so the `sendPdfToTextract` is run each time a file is downloaded to S3
    // // Doc: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html#s3
    // sendPdfToTextract.addEventSource(
    //   new S3EventSource(downloadsBucket, {
    //     events: [s3.EventType.OBJECT_CREATED]
    //   })
    // );

    // // Adds permissions for the sendPdfToTextract read/write from S3 buckets
    // downloadsBucket.grantReadWrite(sendPdfToTextract);

    // // // //
    // // // //

    // // // //
    // Provisions generate-pdf lambda
    // NOTE - we bump the memory to 1024mb here to accommodate the memory requirements for Puppeteer

    // DownloadURL Crawler Lambda
    const writeHtmlToS3Lambda = new lambda.Function(
      this,
      "writeHtmlToS3Lambda",
      {
        code: new lambda.AssetCode("src/write-html-to-s3"),
        handler: "lambda.handler",
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(10),
        environment: {
          S3_BUCKET_NAME: htmlBucket.bucketName,
        },
      }
    );

    // Adds permissions for the writeHtmlToS3Lambda to read/write to S3
    htmlBucket.grantReadWrite(writeHtmlToS3Lambda);

    // // // //
    // Provisions generate-pdf lambda
    // NOTE - we bump the memory to 1024mb here to accommodate the memory requirements for Puppeteer

    // DownloadURL Crawler Lambda
    const generatePdfLambda = new lambda.Function(this, "generatePdfLambda", {
      code: new lambda.AssetCode("src/generate-pdf"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(300),
      memorySize: 1024,
      environment: {
        HTML_S3_BUCKET_NAME: htmlBucket.bucketName,
        PDFS_S3_BUCKET_NAME: pdfsBucket.bucketName,
      },
    });

    // Configure event source so the `sendPdfToTextract` is run each time a file is downloaded to S3
    // Doc: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html#s3
    generatePdfLambda.addEventSource(
      new S3EventSource(htmlBucket, {
        events: [s3.EventType.OBJECT_CREATED],
      })
    );

    // Adds permissions for the generatePdfLambda to read/write to S3
    htmlBucket.grantReadWrite(generatePdfLambda);
    pdfsBucket.grantReadWrite(generatePdfLambda);
  }
}
