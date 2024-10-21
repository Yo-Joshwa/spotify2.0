let currentsong = new Audio();
let songs;
let currfolder;
function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li> 
         
                <img class="invert" src="/images/music.svg" alt="music">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  
                </div>
                <div class="playnow">
                  <img class="invert" src="/images/icons8-play-50.png" alt="img" width="34" height="34" >
                </div>
        
         </li>`;
  }
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}
const playMusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "/images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};
async function displayAlbums() {
  let a = await fetch(`/songs/`)
  let response = await a.text()
  let div = document.createElement("div")
  div.innerHTML = response
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess") ) {
      let folder = e.href.split("/").slice(-2)[0];
      if (folder != "songs") {
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          ` <div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="">
            <div class="play">
            <img src="/images/play.svg" alt="play">
            </div>
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`;
      }
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
        playMusic(songs[0])
    })
})
}
async function main() {
  await getSongs("songs/recents");
  playMusic(songs[0], true);
  displayAlbums();
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/images/pause.svg";
    } else {
      currentsong.pause();
      play.src = "/images/play.svg";
    }
  });
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(
      currentsong.currentTime
    )}/${convertSecondsToMinutes(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  document.querySelector(".range").getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("/images/volume.svg")){
            e.target.src = e.target.src.replace("/images/volume.svg", "/images/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("/images/mute.svg", "/images/volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}
main();
