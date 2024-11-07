import { OPENAI_API_KEY } from "./config.js";
// Function to fetch resources based on resource type and zipcode
export const fetchResources = (resourceType, zipcode) => {
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "flex";
  let container = null;
  if (resourceType == "Diabetes") {
    container = document.getElementById("diabetes-resources-container");
  } else if (resourceType == "Cardiovascular Disease") {
    container = document.getElementById("cvd-resources-container");
  }
  let dropDown = null;
  if (container != null) {
    container.style.display = "none";
    dropDown = container.querySelector("select");
  }
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            {
              text: "Give me a list of resources for the resource type in zipcode with name.",
              type: "text",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              text: `${resourceType}, ${zipcode}`,
              type: "text",
            },
          ],
        },
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resources",
          strict: true,
          schema: {
            type: "object",
            required: ["resources"],
            properties: {
              resources: {
                type: "array",
                items: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      description: "The name of the resource.",
                    },
                  },
                  additionalProperties: false,
                },
                description:
                  "A list of resources, each containing a name.",
              },
            },
            additionalProperties: false,
          },
        },
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const responseContent = data.choices[0].message.content;
      const parsedData = JSON.parse(responseContent);

      if (parsedData.resources && parsedData.resources.length > 0) {
        if (container != null) {
          container.style.display = "block";

          dropDown.innerHTML =
            '<option onchange="openSearchTab()" value="" disabled selected>View resources</option>';
          
          parsedData.resources.forEach((resource) => {
            const option = document.createElement("option");
            option.textContent = resource.name;
            dropDown.appendChild(option);
          });
        }
      }
      loadingIndicator.style.display = "none";
    })
    .catch((error) => {
      console.error("Error fetching resources:", error);
    });
};