import { fetchResources } from './fetchResources.js';
import { EMAIL, PASSWORD } from "./config.js";
const email = EMAIL;
const password = PASSWORD;
const tokenUrl = "https://vpaath.com/oauth/token.json";
const calcUrl = "https://vpaath.com/vpaath_calc.json";

document.getElementById("saveZip").addEventListener("click", function () {
  fetchData();
});

window.onload = () => {
  fetchData();
}

const zipcodeInput = document.getElementById('zipcodeInput');
const saveZipButton = document.getElementById('saveZip');

// Function to validate ZIP code
function isValidZip(zip) {
    return /^\d{5}$/.test(zip);
}

// Listen for changes in the ZIP code input
zipcodeInput.addEventListener('input', function () {
    const zip = zipcodeInput.value;

    // If ZIP code is 5 digits, trigger the save action automatically
    if (isValidZip(zip)) {
        console.log("Auto-saving ZIP code:", zip);
        fetchData(); // Call your existing fetchData function to save the ZIP code
    }
});

// Hide the 'Save' button since we're auto-saving
saveZipButton.style.display = 'none';

const fetchData = () => {

  // First step: get the access token
  fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      grant_type: "password",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.access_token;

      // Second step: Use the access token to call the calculator endpoint
      fetch(calcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          search_mode: "zipcode",
          zipcode: document.getElementById("zipcodeInput").value,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          const emrContainer = document.getElementById("result");
            const formatScore = (score) => {
                return typeof score === 'number' ? `${score}%` : 'N/A';
            };

            // Function to apply labels and color coding based on score
            const getRiskLabelAndColor = (score, type) => {
                let label = '';
                let color = '';

                if (type === 'overall_sdoh') {
                    // Custom scale for Overall SDOH
                    if (score >= 90 && score <= 100) {
                        label = "Normal";
                        color = "green";
                    } else if (score >= 80 && score < 90) {
                        label = "Slight Risk";
                        color = "brown";
                    } else if (score >= 70 && score < 80) {
                        label = "At Risk";
                        color = "orange";
                    } else if (score < 70) {
                        label = "High Risk";
                        color = "red";
                    }
                } else if (type === 'high_utilizer') {
                    // Custom scale for High Utilizer Risk
                    if (score >= 0 && score <= 25) {
                        label = "Normal";
                        color = "green";
                    } else if (score > 25 && score <= 39) {
                        label = "Slight Risk";
                        color = "brown";
                    } else if (score > 39 && score <= 49.9) {
                        label = "At Risk";
                        color = "orange";
                    } else if (score >= 50) {
                        label = "High Risk";
                        color = "red";
                    }
                } else {
                    // Default scale for other scores
                    if (score >= 0 && score <= 10) {
                        label = "Normal";
                        color = "green";
                    } else if (score > 10 && score <= 20) {
                        label = "Slight Risk";
                        color = "brown";
                    } else if (score > 20 && score <= 30) {
                        label = "At Risk";
                        color = "orange";
                    } else if (score > 30) {
                        label = "High Risk";
                        color = "red";
                    }
                }

                return `<span style="color: ${color}">${label}</span>`;
            };

            // Render results with percentage, risk label, and color coding
            emrContainer.innerHTML = `
            <div class="emr-field">
                <div class="emr-label">Overall SDOH:</div>
                <div class="emr-value">${formatScore(result.zipcode.overall_sdoh.score)} ${getRiskLabelAndColor(result.zipcode.overall_sdoh.score, 'overall_sdoh')}</div>
            </div>
            <div class="emr-field">
                <div class="emr-label">Risk for High Cost, High Utilization:</div>
                <div class="emr-value">${formatScore(result.zipcode.high_utilizer.score)} ${getRiskLabelAndColor(result.zipcode.high_utilizer.score, 'high_utilizer')}</div>
            </div>
            <div class="emr-field">
                <div class="emr-label">Diabetes Risk Score:</div>
                <div class="emr-value">${formatScore(result.zipcode.diabetes.score)} ${getRiskLabelAndColor(result.zipcode.diabetes.score)}</div>
            </div>
             <div class="emr-field">
                <div class="emr-label">Cardiovascular Disease Risk Score:</div>
                <div class="emr-value">${formatScore(result.zipcode.cvd.score)} ${getRiskLabelAndColor(result.zipcode.cvd.score)}</div>
            </div>
            <div class="emr-field">
                <div class="emr-label">ER Admission Risk:</div>
                <div class="emr-value">${formatScore(result.zipcode.er_visit.score)} ${getRiskLabelAndColor(result.zipcode.er_visit.score)}</div>
            </div>
            `;

            // fetch resources if at risk
            if (result.zipcode.diabetes.score > 10) {
                fetchResources("Diabetes", result.zipcode.name);
            } else {
                const diabetesDropdownContainer = document.getElementById("diabetes-resources-container");
                if (diabetesDropdownContainer != null) {
                    diabetesDropdownContainer.style.display = "none";
                }
            }

            if (result.zipcode.cvd.score > 10) {
                fetchResources("Cardiovascular Disease", result.zipcode.name);
            } else {
                const cvdDropdownContainer = document.getElementById("cvd-resources-container");
                if (cvdDropdownContainer != null) {
                    cvdDropdownContainer.style.display = "none";
                }
            }

        })
            .catch((error) => {
                document.getElementById("result").textContent = "Error fetching data: " + error;
            })
    })
        .catch((error) => {
            document.getElementById("result").textContent = "Error fetching token: " + error;
        });
};
