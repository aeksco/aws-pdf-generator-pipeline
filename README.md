# aws-pdf-generator-pipeline

:briefcase: Data pipeline for generating PDFs from HTML files server-rendered using React in AWS Lambda and Puppeteer. Built with AWS CDK + TypeScript.

This is an example data pipeline that illustrates one possible approach for large-scale PDF generation - it should serve as a good foundation to modify for your own purposes.

<!-- ![Example Extension Popup](https://i.imgur.com/3F89JQK.png "Example Extension Popup") -->

<!-- https://cloudcraft.co/view/e135397e-a673-411e-9ee7-05a5618052b2?key=R-OLiwplnkA9dtQxtkVqOw&interactive=true&embed=true -->

**Getting Started**

Run the following commands to install dependencies, build the CDK stack, and deploy the CDK Stack to AWS.

```
yarn install
yarn build
cdk bootstrap
cdk deploy
```

### Scripts

- `yarn install` - installs dependencies
- `yarn build` - builds the production-ready CDK Stack
- `yarn test` - runs Jest
- `cdk bootstrap` - bootstraps AWS Cloudformation for your CDK deploy
- `cdk deploy` - deploys the CDK stack to AWS

**Notes**

- Includes very basic tests with Jest.

**Built with**

- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io)
- [Puppeteer](https://jestjs.io)
- [AWS CDK](https://aws.amazon.com/cdk/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [AWS S3](https://aws.amazon.com/s3/)

**Additional Resources**

- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)
- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [Puppeteer Lambda](https://github.com/alixaxel/chrome-aws-lambda)
- [CDK TypeScript Reference](https://docs.aws.amazon.com/cdk/api/latest/typescript/api/index.html)
- [CDK Assertion Package](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/assert)
- [awesome-cdk repo](https://github.com/eladb/awesome-cdk)

**License**

Opens source under the MIT License.

Built with :heart: by [aeksco](https://twitter.com/aeksco)
