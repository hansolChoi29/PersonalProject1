const TMDB_API_KEY = '839ae1e9d19093dbd59c75697bc8a0cc';

const movieContainer = document.getElementById('movie-container');
const searchInput = document.querySelector('#query');

// 모달창 관련 변수
const modalWindow = document.querySelector('.modal');
const modalMovieTitle = document.querySelector('.modal_info_title');
const modalMovieComment = document.querySelector('.modal_info_comment');
const modalMovieDate = document.querySelector('.modal_info_date');
const modalMovieRating = document.querySelector('.modal_info_rating');
const modalMovieImgItem = document.querySelector('.modal_img_item');
const modalCloseBtn = document.querySelector('.close_btn');
// 북마크 관련 변수
const modalAddBtn = document.getElementById('modal_bookadd');
const modalMinusBtn = document.getElementById('modal_bookminus');

let bookmarkPageState = false;
let bookmarks = JSON.parse(localStorage.getItem('bookmarkList')) || [];
// 모든 영화
let allMovies = [];

// API 호출
async function getMovieData() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko&page=1`;


  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });
    const data = await response.json();
    allMovies = data.results;
    displayMovies(allMovies);
  } catch (error) {
    console.error("Error fetching movie data:", error);
  }
}
//서치무비함수에 서치url가져와서 fetch.
async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=ko-KR`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    allMovies = data.results;
    renderMovies(allMovies);
  } catch (error) {
    console.error('데이터를 가져오는 중 오류 발생:', error);
  }
}
searchInput.addEventListener('input', () => {
  const searchValue = searchInput.value.toLowerCase();
  if (searchValue) {
    searchMovies(searchValue);
  } else {
    fetchMovies();
  }
});

getMovieData();
// 영화 정보 렌더링
function displayMovies(movies) {
  movieContainer.innerHTML = ""; // 컨테이너 초기화
  if (movies.length === 0) {
    movieContainer.innerHTML = '<p>영화를 찾을 수 없습니다</p>';
    return;
  }
  movies.forEach((movie) => {
    let stars = ''; // 별을 저장할 변수 초기화
    const vote_average = movie.vote_average; // 평점 가져오기

    // 평점에 따라 별 개수 결정
    if (vote_average < 5) {
      stars = '⭐';
    } else if (vote_average < 6) {
      stars = '⭐⭐';
    } else if (vote_average < 7) {
      stars = '⭐⭐⭐';
    } else if (vote_average < 8) {
      stars = '⭐⭐⭐⭐';
    } else {
      stars = '⭐⭐⭐⭐⭐';
    }

    const movieElement = document.createElement('div');
    movieElement.classList.add("movie");
    movieElement.innerHTML = `
      <div id="card" data-id="${movie.id}">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="poster">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-rating">${stars}</p> 
      </div>
    `;
    movieContainer.appendChild(movieElement); // 영화 요소 추가
  });
}

// 검색기능
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchValue)
  );
  displayMovies(filteredMovies);
});

// 모달창 렌더링 함수
function modalRenderMovies(movie) {
  modalMovieTitle.innerHTML = movie.title;
  modalMovieTitle.setAttribute("data-id", movie.id);
  modalMovieComment.innerHTML = movie.overview;
  modalMovieDate.innerHTML = movie.release_date;
  modalMovieRating.innerHTML = movie.vote_average;
  modalMovieImgItem.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  scrollDisable();
}

// 영화정보 클릭
movieContainer.addEventListener("click", (e) => {
  const clickedCard = e.target.closest("#card");
  if (clickedCard) {
    // 클릭된 영화의 ID 가져오기
    const clickedMovieId = parseInt(clickedCard.getAttribute("data-id"));
    const selectedMovie = allMovies.find(
      (movie) => movie.id === clickedMovieId
    );
    if (selectedMovie) {
      modalRenderMovies(selectedMovie);
      modalWindow.style.display = "block";
    }
  }
});
// 모달창 닫기 버튼
modalCloseBtn.addEventListener("click", () => {
  modalWindow.style.display = "none";
  scrollAble();
});
// 외부 스크롤 막기
function scrollDisable() {
  document.querySelector("body").classList.add("scroll_disable");
}
// 외부 스크롤 재작동
function scrollAble() {
  document.querySelector("body").classList.remove("scroll_disable");
}



modalAddBtn.addEventListener('click', () => {
  // 모달에서 영화 ID, 제목
  const movieId = modalMovieTitle.getAttribute('data-id');
  const movieTitle = modalMovieTitle.innerHTML;
  const moviePoster = modalMovieImgItem.src; // 포스터 경로 가져오기
  const movieRating = modalMovieRating.innerHTML; // 평점 가져오기

  // 현재 저장된 북마크 목록 불러오기
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkList')) || [];

  // 중복 방지: 이미 북마크에 있는지 확인
  if (!bookmarks.some(movie => movie.id === parseInt(movieId))) {
    bookmarks.push({
      id: parseInt(movieId),
      title: movieTitle,
      poster: moviePoster, // 포스터 저장
      rating: movieRating // 평점 저장
    });

    // 로컬 스토리지에 북마크 목록 저장
    localStorage.setItem('bookmarkList', JSON.stringify(bookmarks));
    alert('북마크 추가 완료!');
  } else {
    alert('이미 북마크에 추가된 영화입니다.');
  }

});


// 북마크 제거 버튼 선택
modalMinusBtn.addEventListener('click', () => {
  // 모달에서 영화 ID 가져오기
  const movieId = modalMovieTitle.getAttribute('data-id');
  // 현재 저장된 북마크 목록 불러오기
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkList')) || [];
  // 제거할 영화 필터링
  const updatedBookmarks = bookmarks.filter(movie => movie.id !== parseInt(movieId));

  // 로컬 스토리지에 업데이트된 북마크 목록 저장
  localStorage.setItem('bookmarkList', JSON.stringify(updatedBookmarks));
  if (bookmarkPageState) {
    movieContainer.innerHTML = '';
    loadBookmarks();
    alert('북마크 제거 완료!');
  } else {
    alert('북마크로 설정되어있지 않습니다.')
  }
});

// 앱 초기화 시 북마크 로드
function loadBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarkList")) || [];
  // 저장된 북마크 목록 불러오기

  const bookmarkContainer = document.getElementById("bookmark-container");
  bookmarkContainer.innerHTML = ""; // 초기화
  // 북마크 목록을 화면에 표시
  bookmarks.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");
    movieElement.innerHTML = `
         <div id="card" data-id="${movie.id}">
          <h3 class="movie-title">${movie.title}</h3>
          <img src="${movie.poster}" />
        </div>
      `;
    movieContainer.appendChild(movieElement);
  });
}

// 북마크 버튼 선택
const bookmarkBtn = document.querySelector('.bookmark-Btn');
bookmarkBtn.addEventListener('click', () => {
  bookmarkPageState = true;
  const bookmarks = JSON.parse(localStorage.getItem('bookmarkList')) || [];
  // 영화 컨테이너 초기화
  movieContainer.innerHTML = '';
  console.log(bookmarkBtn);
  // 북마크된 영화가 없을 경우 메시지 표시
  if (bookmarks.length === 0) {
    movieContainer.innerHTML = '<p>북마크가 없습니다.</p>';
    return;
  }

  // 북마크된 영화 렌더링
  loadBookmarks();
});