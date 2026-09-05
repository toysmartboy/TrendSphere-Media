//=================================================
//                  DARK MODE
//=================================================

const darkModeBtn = document.getElementById("dark-mode-btn");


//=================================================
//              LOAD SAVED THEME
//=================================================

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    if (darkModeBtn) {

        darkModeBtn.classList.remove("bx-moon");
        darkModeBtn.classList.add("bx-sun");

    }

}


//=================================================
//              TOGGLE THEME
//=================================================

if (darkModeBtn) {

    darkModeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");


        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            darkModeBtn.classList.remove("bx-moon");
            darkModeBtn.classList.add("bx-sun");

        } else {

            localStorage.setItem("theme", "light");

            darkModeBtn.classList.remove("bx-sun");
            darkModeBtn.classList.add("bx-moon");

        }

    });

}