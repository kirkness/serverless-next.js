import { toLambdaOption } from "../src/utils/toLambdaOption";
import { readInvalidationPathsFromManifest } from "../src/utils/readInvalidationPathsFromManifest";
import { OriginRequestDefaultHandlerManifest } from "@sls-next/lambda-at-edge";

describe("CDK Utils", () => {
  it.each`
    args                                                | expectedReturn
    ${["defaultLambda", { defaultLambda: 1 }]}          | ${1}
    ${["apiLambda", { defaultLambda: 1 }]}              | ${undefined}
    ${["apiLambda", 1]}                                 | ${1}
    ${["imageLambda", { imageLambda: { foo: "bar" } }]} | ${{ foo: "bar" }}
    ${["defaultLambda"]}                                | ${undefined}
  `("toLambdaOption", ({ args: [key, option], expectedReturn }) => {
    expect(toLambdaOption(key, option)).toStrictEqual(expectedReturn);
  });

  const file = { file: "", regex: "" };
  const ssgRoute = {
    dataRoute: "",
    dataRouteRegex: "",
    fallback: null,
    routeRegex: ""
  };
  const nonDynamicSsgRoute = {
    dataRoute: "",
    initialRevalidateSeconds: false,
    srcRoute: ""
  };
  test("readInvalidationPathsFromManifest", () => {
    expect(
      readInvalidationPathsFromManifest({
        pages: {
          html: {
            dynamic: {
              "/:id": file,
              "/:id/test": file,
              "/test/:id/test": file
            },
            nonDynamic: { "/id": "" }
          },
          ssr: {
            dynamic: { "/ssr/:id": file },
            nonDynamic: { "/ssr-page": "" }
          },
          ssg: {
            dynamic: { "/ssg/:id": ssgRoute },
            nonDynamic: { "/ssg-page": nonDynamicSsgRoute }
          }
        } as OriginRequestDefaultHandlerManifest["pages"]
      } as any).sort()
    ).toStrictEqual(
      [
        "/*", // /:id
        "/*", // /:id/test
        "/test/*", // /test/:id/test
        "/id", // /id
        "/ssr/*", // /ssr/:id
        "/ssr-page", // /ssr-page
        "/ssg/*", // /ssg/:id
        "/ssg-page" // /ssg-page
      ].sort()
    );
  });
});
