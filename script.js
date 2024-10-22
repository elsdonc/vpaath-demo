const email = "yourEmail";
const password = "yourPassword";
const tokenUrl = "https://vpaath.com/oauth/token.json";
const calcUrl = "https://vpaath.com/vpaath_calc.json";


document.getElementById("saveZip").addEventListener("click", function () {
  fetchData();
});

window.onload = () => {
  fetchData();
}

let editZipButton = document.getElementById('editZip');
let saveZipButton = document.getElementById('saveZip');

editZipButton.addEventListener('click', function() {
  zipcodeInput.disabled = false;
  editZipButton.style.display = 'none';
  saveZipButton.style.display = 'inline-block';
});

saveZipButton.addEventListener('click', function() {
  zipcodeInput.disabled = true;
  editZipButton.style.display = 'inline-block';
  saveZipButton.style.display = 'none';
});

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
          emrContainer.innerHTML = `
          <div class="emr-field">
              <div class="emr-label">Overall SDOH:</div>
              <div class="emr-value">${
                result.zipcode.overall_sdoh.score || "N/A"
              }</div>
          </div>
          <div class="emr-field">
              <div class="emr-label">Risk for High Cost, High Utilization:</div>
              <div class="emr-value">${
                result.zipcode.high_utilizer.score || "N/A"
              }</div>
          </div>
          <div class="emr-field">
              <div class="emr-label">Diabetes Risk Score:</div>
              <div class="emr-value">${
                result.zipcode.diabetes.score || "N/A"
              }</div>
          </div>
          <div class="emr-field">
              <div class="emr-label">ER Admission Risk:</div>
              <div class="emr-value">${
                result.zipcode.er_visit.score || "N/A"
              }</div>
          </div>
      `;
        })
        .catch((error) => {
          document.getElementById("result").textContent =
            "Error fetching data: " + error;
        });
    })
    .catch((error) => {
      document.getElementById("result").textContent =
        "Error fetching token: " + error;
    });
};
