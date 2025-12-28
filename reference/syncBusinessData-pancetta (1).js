const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

let categoryExtended = [];
let timeBasedPricingTimeRangesData = [];

async function getExpWebData() {
  try {
    return new Promise((resolve, reject) => {
      fetch(`https://pancetta.paisasell.com/api/v1/business/expWeb`, {
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
            return resolve({ error: true });
          }

          return resolve(result);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  } catch (e) {
    console.error(e);
  }
}

async function syncCategoryData() {
  const result = await getExpWebData();
  if (result.error) return;

  const currentCategoryExtended = result.data.details.categoriesExtended;

  if (
    currentCategoryExtended
      .map((e) => e.categoryImage)
      .sort((a, b) => b.localeCompare(a))
      .join("") !==
    categoryExtended
      .map((e) => e.categoryImage)
      .sort((a, b) => b.localeCompare(a))
      .join("")
  ) {
    // new images must have arrived
    for (const one of currentCategoryExtended.filter((e) => e.categoryImage)) {
      const imageName = one.categoryImage;

      fetch(`https://pancetta.paisasell.com/category-images/${imageName}`)
        .then((response) => response.buffer())
        .then((buffer) => {
          if (buffer.length > 0)
            fs.writeFile(
              path.join(__dirname, "/uploads/category-images", imageName),
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
  }

  categoryExtended = currentCategoryExtended;
}

async function syncTimeBasedPricingTimeRangesData() {
  const result = await getExpWebData();
  if (result.error) return;

  timeBasedPricingTimeRangesData = result.data.configData.timeBasedPricingTimeRanges;
}

module.exports = {
  syncCategoryData,
  syncTimeBasedPricingTimeRangesData,
  getCategoryExtended: () => categoryExtended,
  getTimeBasedPricingTimeRangesData: () => timeBasedPricingTimeRangesData,
};




this part is a response part 

{
  "message": "OK",
  "data": {
    "_id": "684c3107b7bc24ced446aa72",
    "username": "pancetta",
    "businessName": "Pancetta Nepoli Pizzeria",
    "billingName": "Pancetta Nepoli Pizzeria",
    "email": "Pancetta@paisa.cloud",
    "phone": "",
    "panNumber": "",
    "businessImage": "684c3107b7bc24ced446aa72_1750174986465.jpg",
    "address": "Forest Rd, Hurstville NSW",
    "serviceCharge": 0,
    "vat": 0,
    "details": {
      "tableList": [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9"
      ],
      "roomsList": [],
      "categories": [],
      "categoriesExtended": [
        {
          "categoryName": "Entree",
          "categoryImage": "",
          "sortPriority": 1
        },
        {
          "categoryName": "Salads",
          "categoryImage": "",
          "sortPriority": 1
        },
        {
          "categoryName": "Fresh Hanmade Gnocchi",
          "categoryImage": "",
          "sortPriority": 1
        },
        {
          "categoryName": "Woodfired Pizza",
          "categoryImage": "",
          "sortPriority": 1
        }
      ],
      "inviteText": "",
      "hotelTermsNotice": "",
      "openingTime": "09:00",
      "closingTime": "22:00",
      "latlongData": ""
    },
    "configData": {
      "productPricesIncludeVAT": false,
      "showInPaisaDiscovery": true,
      "acceptPaisasellOrders": true,
      "paisaDiscoveryTheme": "1",
      "paisaDiscoveryThemeBGColor": "#ffffff",
      "paisaDiscoveryThemePrimaryColor": "#d63829",
      "paisaDiscoveryThemeSecondaryColor": "#29C7D6",
      "paisaDiscoveryThemeTextColor": "#150502",
      "timeBasedPricingTimeRanges": []
    }
  }
}


