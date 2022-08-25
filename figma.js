const request = require("request");
const fs = require("fs");

const api_endpoint = "https://api.figma.com/v1";
const personal_access_token = "figd_1hUW2gToSyt1PRhqYyRvkf-RJluV5hEz9dvoxU0_"; // https://www.figma.com/developers/docs#auth-dev-token

function downloadSvgFromAWS(url) {
  return new Promise((resolve, reject) => {
    request.get(
      url,
      {
        headers: {
          "Content-Type": "images/svg+xml",
        },
      },
      function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      }
    );
  });
}

function getComponentsFromChildren(children) {
  const components = [];
  const check = (c) => {
    if (c.type == "FRAME") {
      components.push(c);
    } else if (c.children) {
      c.children.forEach(check);
    }
  };
  children.forEach(check);
  return components;
}

function getImageUrls(file_key, componentIds) {
  return new Promise((resolve, reject) => {
    request.get(
      `${api_endpoint}/images/${file_key}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-figma-token": personal_access_token,
        },
        qs: {
          ids: componentIds,
          format: "svg",
        },
        json: true,
      },
      function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body.images);
        }
      }
    );
  });
}

function getJSONFromFigmaFile(file_key) {
  return new Promise((resolve, reject) => {
    request.get(
      `${api_endpoint}/files/${file_key}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-figma-token": personal_access_token,
        },
      },
      function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          const components = getComponentsFromChildren(
            JSON.parse(body).document.children
          );
          fs.writeFile(
            __dirname + "/tmp/test.json",
            `${JSON.stringify(components)}`,
            function (err) {
              if (err) {
                return console.log(err);
              }
              console.log("File saved");
            }
          );
          //   getImageUrls(file_key, components.map((c) => c.id).join(",")).then(
          //     (images) => {
          //       const imagesArray = Object.keys(images).map((key) => images[key]);
          //       downloadSvgFromAWS(imagesArray[0]).then((image) =>
          //         console.log(image)
          //       );
          //       resolve(imagesArray);
          //     }
          //   );
        }
      }
    );
  });
}

getJSONFromFigmaFile("0P1xTY8aJRsktjiGEixjhL")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log("err", err);
  });
