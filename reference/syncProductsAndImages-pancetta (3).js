const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const Products = require("../models/products");

module.exports = async () => {
  try {
    fetch(`https://pancetta.paisasell.com/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "pancetta.paisasell.com",
      },
      body: JSON.stringify({ businessName: "pancetta" }),
    })
      .then((res) => res.json())
      .then(async (result) => {
        if (result.error) {
          console.error(result.error);
        }

        for (const one of result.data) {
          await Products.findOneAndUpdate(
            { _id: one._id },
            {
              $set: (() => {
                const mid = JSON.parse(JSON.stringify(one));
                delete mid._id;
                return { ...mid };
              })(),
            },
            { upsert: true }
          ).exec();
        }

        fs.readdir(path.join(__dirname, "/uploads/products-images"), (err, files) => {
          if (err) {
            console.error("Error reading directory:", err);
            return;
          }

          const incomingImageFiles = result.data.map((e) => e.image).flat();

          const currentImageFiles = files;

          const imageFilesToPull = incomingImageFiles.filter(
            (e) => !currentImageFiles.includes(e)
          );

          for (const one of imageFilesToPull) {
            fetch(`https://pancetta.paisasell.com/product-images/${one}`)
              .then((response) => response.buffer())
              .then((buffer) => {
                fs.writeFile(
                  path.join(__dirname, "/uploads/products-images", one),
                  buffer,
                  (err) => {
                    if (err) {
                      console.error(err);
                    } else {
                      console.log("Image downloaded successfully");
                    }
                  }
                );
              })
              .catch((error) => {
                console.error(error);
              });
          }
        });

        await Products.updateMany(
          { _id: { $in: result.data.map((e) => e._id) } },
          { $set: { status: "active" } }
        );
        await Products.updateMany(
          { _id: { $nin: result.data.map((e) => e._id) } },
          { $set: { status: "inactive" } }
        );

        return;
      })
      .catch((e) => {
        console.error(e);
      });
  } catch (e) {
    console.error(e);
  }
};
