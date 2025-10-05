
    // Course mapping based on interest field
    const courseMapping = {
      "Engineering": [
        "BTech - Computer Science",
        "BTech - Mechanical",
        "BTech - Electrical",
        "BTech - Civil",
        "BTech - Electronics & Communication",
        "BTech - Information Technology",
        "BTech - Chemical",
        "BE - Computer Science",
        "BE - Mechanical",
        "Other"
      ],
      "Medical": [
        "MBBS",
        "BDS",
        "BAMS",
        "BHMS",
        "B.Pharm",
        "BSc Nursing",
        "BPT",
        "BUMS",
        "Other"
      ],
      "Arts": [
        "BA - English",
        "BA - History",
        "BA - Political Science",
        "BA - Psychology",
        "BA - Sociology",
        "BA - Economics",
        "BA - Geography",
        "BFA",
        "Other"
      ],
      "Commerce": [
        "BCom",
        "BCom Honours",
        "BBA",
        "BMS",
        "CA Foundation",
        "Other"
      ],
      "Science": [
        "BSc - Physics",
        "BSc - Chemistry",
        "BSc - Mathematics",
        "BSc - Biology",
        "BSc - Computer Science",
        "BSc - Biotechnology",
        "Other"
      ],
      "Management": [
        "BBA",
        "BMS",
        "BBM",
        "BHM",
        "Other"
      ],
      "Law": [
        "BA LLB",
        "BBA LLB",
        "BCom LLB",
        "LLB",
        "Other"
      ],
      "Design": [
        "BDes - Fashion Design",
        "BDes - Interior Design",
        "BDes - Product Design",
        "BDes - Graphic Design",
        "BArch",
        "Other"
      ],
      "Other": [
        "Other"
      ]
    };

    const interestSelect = document.getElementById("interest");
    const courseSelect = document.getElementById("course");
    const customInterest = document.getElementById("customInterest");
    const customCourse = document.getElementById("customCourse");

    // Handle interest field change
    interestSelect.addEventListener("change", function () {
      const selectedInterest = this.value;

      if (selectedInterest === "Other") {
        customInterest.style.display = "block";
        courseSelect.disabled = true;
        courseSelect.innerHTML = '<option value="">--First Enter Custom Interest--</option>';
      } else if (selectedInterest === "") {
        customInterest.style.display = "none";
        courseSelect.disabled = true;
        courseSelect.innerHTML = '<option value="">--First Select Interest Field--</option>';
      } else {
        customInterest.style.display = "none";
        courseSelect.disabled = false;

        // Populate course dropdown based on selected interest
        const courses = courseMapping[selectedInterest] || [];
        courseSelect.innerHTML = '<option value="">--Select Your Course--</option>';

        courses.forEach(course => {
          const option = document.createElement("option");
          option.value = course;
          option.textContent = course;
          courseSelect.appendChild(option);
        });
      }

      // Reset course selection
      courseSelect.value = "";
      customCourse.style.display = "none";
    });

    // Handle course change
    courseSelect.addEventListener("change", function () {
      if (this.value === "Other") {
        customCourse.style.display = "block";
      } else {
        customCourse.style.display = "none";
      }
    });

    // Handle custom interest input
    customInterest.addEventListener("input", function() {
      if (this.value.trim() !== "") {
        courseSelect.disabled = false;
        courseSelect.innerHTML = '<option value="">--Select Your Course--</option><option value="Other">Other</option>';
      } else {
        courseSelect.disabled = true;
        courseSelect.innerHTML = '<option value="">--First Enter Custom Interest--</option>';
      }
    });

    // Form submission
    document.getElementById("collegeForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const output = document.getElementById("output");
      output.innerHTML = '<div class="loading">🔍 Searching for the best colleges for you</div>';

      const location = document.getElementById("location").value;
      const budget = document.getElementById("budget").value;
      const interestValue = interestSelect.value;
      const interest = interestValue === "Other" ? customInterest.value : interestValue;
      const courseValue = courseSelect.value;
      const course = courseValue === "Other" ? customCourse.value : courseValue;

      const data = { location, budget, interest, course };

      try {
        const res = await fetch("https://college-recommender-app.onrender.com/recommend_colleges/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();

        if (json.result && Array.isArray(json.result)) {
          let html = `
            <div class="output-header">
              <h2>🎯 Top College Recommendations</h2>
              <p>Based on your preferences, here are the best matches for you</p>
            </div>
          `;

          json.result.forEach((c, index) => {
            html += `
              <div class="card" style="animation: fadeInUp 0.5s ease ${index * 0.1}s both;">
                <h3>${c.college_name}</h3>
                <div class="card-content">
                  <div class="card-item">
                    <span class="card-label">🏆 NIRF Rank</span>
                    <span class="card-value">${c.nirf_rank}</span>
                  </div>
                  <div class="card-item">
                    <span class="card-label">📚 Course</span>
                    <span class="card-value">${c.course_offered}</span>
                  </div>
                  <div class="card-item">
                    <span class="card-label">📝 Entrance Exam</span>
                    <span class="card-value">${c.entrance_exam}</span>
                  </div>
                  <div class="card-item">
                    <span class="card-label">💵 Expected Fee</span>
                    <span class="card-value">${c.expected_price_per_course}</span>
                  </div>
                </div>
                <a href="${c.official_website}" target="_blank" class="card-link">
                  🌐 Visit Official Website →
                </a>
              </div>
            `;
          });
          output.innerHTML = html;
        } else {
          output.innerHTML = `<div class="error">⚠️ ${json.error || "Invalid response. Please try again."}</div>`;
        }
      } catch (err) {
        output.innerHTML = `<div class="error">❌ Unable to connect to server. Please check your connection and try again.</div>`;
      }
    });
