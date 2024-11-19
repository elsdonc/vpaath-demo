import { fetchResources } from "./fetchResources.js";
import { EMAIL, PASSWORD } from "./config.js";
const email = EMAIL;
const password = PASSWORD;
const tokenUrl = "https://vpaath.com/oauth/token.json";
const calcUrl = "https://vpaath.com/vpaath_calc.json";

window.onload = async () => {
    const data = await fetchData(document.getElementById("zipcodeInput").value);
    updateSDOHDataBox(data);
};

// Function to validate ZIP code
function isValidZip(zip) {
    return /^\d{5}$/.test(zip);
}

// Listen for changes in the ZIP code input
zipcodeInput.addEventListener("input", async function () {
    // If ZIP code is 5 digits, trigger the save action automatically
    if (isValidZip(document.getElementById("zipcodeInput")).value) {
        const data = await fetchData(document.getElementById("zipcodeInput").value);
        updateSDOHDataBox(data);
    }
});

const fetchData = async (ZIPCODE) => {
    // get access token
    let authResponse = await fetch(tokenUrl, {
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
    let data = await authResponse.json();
    const accessToken = data.access_token;

    // use access token to get sdoh data
    let sdohResponse = await fetch(calcUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            search_mode: "zipcode",
            zipcode: ZIPCODE,
        }),
    })
    let result = await sdohResponse.json();
    return result
};

const updateSDOHDataBox = (result) => {
    const emrContainer = document.getElementById("result");
    const formatScore = (score) => {
        return typeof score === "number" ? `${score}%` : "N/A";
    };

    // Function to apply labels and color coding based on score
    const getRiskLabelAndColor = (score, type) => {
        let label = "";
        let color = "";

        if (type === "overall_sdoh") {
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
        } else if (type === "high_utilizer") {
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
        <div class="emr-value">${formatScore(
            result.zipcode.overall_sdoh.score
        )} ${getRiskLabelAndColor(
                result.zipcode.overall_sdoh.score,
                "overall_sdoh"
            )}</div>
    </div>
    <div class="emr-field">
        <div class="emr-label">Risk for High Cost, High Utilization:</div>
        <div class="emr-value">${formatScore(
            result.zipcode.high_utilizer.score
        )} ${getRiskLabelAndColor(
                result.zipcode.high_utilizer.score,
                "high_utilizer"
            )}</div>
    </div>
    <div class="emr-field">
        <div class="emr-label">Diabetes Risk Score:</div>
        <div class="emr-value">${formatScore(
            result.zipcode.diabetes.score
        )} ${getRiskLabelAndColor(result.zipcode.diabetes.score)}</div>
    </div>
        <div class="emr-field">
        <div class="emr-label">Cardiovascular Disease Risk Score:</div>
        <div class="emr-value">${formatScore(
            result.zipcode.cvd.score
        )} ${getRiskLabelAndColor(result.zipcode.cvd.score)}</div>
    </div>
    <div class="emr-field">
        <div class="emr-label">ER Admission Risk:</div>
        <div class="emr-value">${formatScore(
            result.zipcode.er_visit.score
        )} ${getRiskLabelAndColor(result.zipcode.er_visit.score)}</div>
    </div>
    `;

    // fetch resources if at risk
    if (result.zipcode.diabetes.score > 10) {
        fetchResources("Diabetes", result.zipcode.name);
    } else {
        const diabetesDropdownContainer =
            document.getElementById(
                "diabetes-resources-container"
            );
        if (diabetesDropdownContainer != null) {
            diabetesDropdownContainer.style.display = "none";
        }
    }

    if (result.zipcode.cvd.score > 10) {
        fetchResources(
            "Cardiovascular Disease",
            result.zipcode.name
        );
    } else {
        const cvdDropdownContainer = document.getElementById(
            "cvd-resources-container"
        );
        if (cvdDropdownContainer != null) {
            cvdDropdownContainer.style.display = "none";
        }
    }
}

const members = [
    {
        id: 1,
        name: "John Doe",
        address: "123 First St.",
        city: "Minneapolis",
        state: "Minnesota",
        zipcode: "55419",
        dob: "01/15/1985",
        gender: "Male",
        known_conditions: "Type 2 Diabetes, Hypertension",
        allergies: "Penicillin",
        surgeries: "Appendectomy (2015)",
        current_meds:
            "Metformin: 500mg, twice daily, Lisinopril: 10mg, once daily",
        lab_results:
            "Hemoglobin A1c: 7.8% (08/12/2024), Cholesterol: 210 mg/dL (08/12/2024), Blood Pressure: 135/85 mmHg (08/12/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
    {
        id: 2,
        name: "Jane Smith",
        address: "456 Elm St.",
        city: "St. Paul",
        state: "Minnesota",
        zipcode: "55102",
        dob: "04/22/1992",
        gender: "Female",
        known_conditions: "Asthma, Hypothyroidism",
        allergies: "Peanuts",
        surgeries: "Gallbladder Removal (2019)",
        current_meds:
            "Levothyroxine: 75mcg, once daily, Albuterol Inhaler: as needed",
        lab_results:
            "TSH: 4.5 mIU/L (09/10/2024), Cholesterol: 190 mg/dL (09/10/2024), Blood Pressure: 120/80 mmHg (09/10/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
    {
        id: 3,
        name: "Michael Johnson",
        address: "789 Oak St.",
        city: "Bloomington",
        state: "Minnesota",
        zipcode: "55425",
        dob: "07/08/1978",
        gender: "Male",
        known_conditions: "Chronic Kidney Disease (Stage 3)",
        allergies: "Sulfa Drugs",
        surgeries: "Kidney Biopsy (2020)",
        current_meds:
            "Losartan: 50mg, once daily, Vitamin D: 2000 IU, once daily",
        lab_results:
            "Creatinine: 1.8 mg/dL (08/05/2024), GFR: 45 mL/min/1.73m² (08/05/2024), Potassium: 4.2 mEq/L (08/05/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
    {
        id: 4,
        name: "Emily Davis",
        address: "321 Pine St.",
        city: "Edina",
        state: "Minnesota",
        zipcode: "55436",
        dob: "03/18/1987",
        gender: "Female",
        known_conditions: "Type 1 Diabetes",
        allergies: "None",
        surgeries: "Cataract Surgery (2022)",
        current_meds:
            "Insulin Glargine: 20 units, nightly, Insulin Lispro: sliding scale with meals",
        lab_results:
            "Hemoglobin A1c: 6.9% (07/25/2024), Blood Glucose: 120 mg/dL (07/25/2024), Cholesterol: 180 mg/dL (07/25/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
    {
        id: 5,
        name: "David Brown",
        address: "654 Maple Ave.",
        city: "Plymouth",
        state: "Minnesota",
        zipcode: "55447",
        dob: "11/30/1965",
        gender: "Male",
        known_conditions: "Hyperlipidemia, Osteoarthritis",
        allergies: "None",
        surgeries: "Knee Replacement (2021)",
        current_meds:
            "Atorvastatin: 20mg, once daily, Ibuprofen: 200mg, as needed",
        lab_results:
            "Cholesterol: 250 mg/dL (10/15/2024), Triglycerides: 300 mg/dL (10/15/2024), Blood Pressure: 140/90 mmHg (10/15/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
    {
        id: 6,
        name: "Sophia Martinez",
        address: "987 Birch Blvd.",
        city: "Rochester",
        state: "Minnesota",
        zipcode: "55902",
        dob: "09/12/1985",
        gender: "Female",
        known_conditions: "Rheumatoid Arthritis, Anemia",
        allergies: "NSAIDs",
        surgeries: "Wrist Fusion Surgery (2023)",
        current_meds:
            "Methotrexate: 15mg, once weekly, Ferrous Sulfate: 325mg, once daily",
        lab_results:
            "CRP: 15 mg/L (09/30/2024), Hemoglobin: 10.5 g/dL (09/30/2024), Blood Pressure: 115/75 mmHg (09/30/2024)",
        overall_sdoh: null,
        risk_high_cost_high_utilization: null,
        diabetes_risk: null,
        cardiovascular_disease_risk: null,
        er_admission_risk: null,
    },
];

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
        const memberId = tab.getAttribute("data-member-id");
        const member = members.find((m) => m.id == memberId);

        if (member) {
            // Populate EMR with Member Data
            document.getElementById("zipcodeInput").value = member.zipcode;
            document.getElementById("memberName").textContent = member.name;
            document.getElementById("address").textContent = member.address;
            document.getElementById("address2").textContent = member.address2;
            document.getElementById("dob").textContent = member.dob;
            document.getElementById("gender").textContent = member.gender;
            document.getElementById("knownConditions").textContent =
                member.known_conditions;
            document.getElementById("allergies").textContent = member.allergies;
            document.getElementById("surgeries").textContent = member.surgeries;
            document.getElementById("currentMeds").textContent =
                member.current_meds;
            document.getElementById("labResults").textContent =
                member.lab_results;
        }

        const data = await fetchData(document.getElementById("zipcodeInput").value);
        updateSDOHDataBox(data);
    });
});

// make default tab the first tab
document.addEventListener("DOMContentLoaded", () => {
    const firstTab = document.querySelector(".tab");
    if (firstTab) {
        firstTab.click();
    }
});

// write a report to excel file
document.getElementById("downloadReport").addEventListener("click", async () => {
    function writeToExcel(data) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
        XLSX.writeFile(workbook, "MemberDataResults.xlsx");
    }

    const results = [];
    for (const member of members) {
        try {
            const result = await fetchData(member.zipcode);
            // Add the member details and fetchData result to the results array
            results.push({
                "Name": member.name,
                "Address": member.address,
                "City": member.city,
                "State": member.state,
                "DOB": member.dob,
                "Gender": member.gender,
                "Zipcode": member.zipcode,
                "Overall SDOH Score": result.zipcode.overall_sdoh.score,
                "Risk for High Cost High Utilization": result.zipcode.high_utilizer.score,
                "Diabetes Risk Score": result.zipcode.diabetes.score,
                "Cardiovascular Disease Risk Score": result.zipcode.cvd.score,
                "ER Admission Risk Score": result.zipcode.er_visit.score
            });
        } catch (error) {
            console.error(`Error processing member ${member.name}:`, error);
        }
    }

    writeToExcel(results);
});