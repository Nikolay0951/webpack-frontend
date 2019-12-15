// const baseUrl = 'http://localhost:9999';
const baseUrl = 'https://nikolay0951-api.herokuapp.com';

let firstSeenId = 0;
let lastSeenId = 0;

const rootEl = document.getElementById('root');
const formEl = document.createElement('form');
formEl.className = 'form-inline mb-2';
formEl.innerHTML = `
    <div class="form-group">
        <input class="form-control" data-id="content" placeholder="Введите текст или url источника" size="30">
    </div>
    <select class="custom-select" data-id="type">
        <option value="regular">Обычный</option>
        <option value="image">Изображение</option>
        <option value="audio">Аудио</option>
        <option value="video">Видео</option>
    </select>
    <button class="btn btn-info">Добавить</button>
`;
rootEl.appendChild(formEl);

OldPosts();

const contentEl = formEl.querySelector('[data-id=content]');
contentEl.value = localStorage.getItem('content');
contentEl.addEventListener('input', e => {
    localStorage.setItem('content', contentEl.value);
});

const typeEl = formEl.querySelector('[data-id=type]');
typeEl.value = localStorage.getItem('type') || 'regular';
typeEl.addEventListener('input', e => {
    localStorage.setItem('type', typeEl.value);
});


formEl.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
        content: contentEl.value,
        type: typeEl.value,
    };
    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),

    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }).then(data => {
        contentEl.value = '';
        typeEl.value = 'regular';
        localStorage.clear();
        renderNewPosts(data);
    }
    ).catch(error => {
        console.log(error);
    });
});

rootEl.appendChild(formEl);


const newPostsBtn = document.createElement('button');
newPostsBtn.textContent = `Показать новые записи`;
newPostsBtn.className = 'btn btn-info btn-block';
newPostsBtn.style.display = "none";
newPostsBtn.addEventListener('click', () => {
    fetch(`${baseUrl}/posts/newPosts/${firstSeenId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }
        ).then(
            data => {
                newPostsBtn.style.display = "none";
                console.log(data);
                renderNewPosts(data);
            }
        ).catch(error => {
            console.log(error);
        });
});
rootEl.appendChild(newPostsBtn);    

const postsEl = document.createElement('div');
rootEl.appendChild(postsEl)

const oldPostBtn = document.createElement('button');
oldPostBtn.textContent = 'Предыдущие записи';
oldPostBtn.className = 'btn btn-info btn-block';
oldPostBtn.addEventListener('click', () => {
    OldPosts()
    oldPostBtn.style.display = "none";
});
rootEl.appendChild(oldPostBtn);

function OldPosts() {
    fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }
        ).then(
            data => {
                console.log(data);
                renderOldPosts(data);
            }
        ).catch(error => {
            console.log(error);
        });
}



function renderOldPosts(data) {
    data.reverse();
    if (data.length < 5) {
        oldPostBtn.style.display = "none";
        if (data.length === 0) {
            return;
        }
    } else {
        fetch(`${baseUrl}/posts/poll-seenPosts/${data[data.length - 1].id}`)
            .then(
                response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                },
            ).then(
                data => {
                    console.log(data);
                    if (data === 'true') {
                        ddOldPostsButtonEl.style.display = "block";
                    };
                }
            ).catch(error => {
                console.log(error);
            })
    }

    if (firstSeenId === 0) {
        firstSeenId = data[0].id;
    }
    lastSeenId = data[data.length - 1].id;

    for (const item of data) {
        postsEl.appendChild(rebuildList(item));
    }
}


function renderNewPosts(data) {
    if (data.length === 0) {
        return;
    }
    if (Array.isArray(data)) {
        firstSeenId = data[0].id;
        for (const item of data) {
            postsEl.insertBefore(rebuildList(item), postsEl.children[0]);
        }
    } else {
        firstSeenId = data.id;
        postsEl.insertBefore(rebuildList(data=), postsEl.children[0]);
    }
}

function rebuildList(item) {
    const el = document.createElement('div');
    el.className = 'card-posts';

    if (item.type === 'regular') {
        el.innerHTML = `
        <div class="card">
            <div class="card-body">
                <p class="card-text">${item.content}</p>
                <button class="btn btn-primary" data-action="like">👍🏼 ${item.likes}</button>
                <button class="btn btn-secondary" data-action="dislike">👎🏻</button>
                <button class="btn btn-danger" data-action="delete">X</button>
            </div>
        </div>
        `;
    } else if (item.type === 'image') {
        el.innerHTML = `
        <div class="card">
            <img src="${item.content}" class="card-img-top">
            <div class="card-body">
                <button class="btn btn-primary" data-action="like">👍🏼 ${item.likes}</button>
                <button class="btn btn-secondary" data-action="dislike">👎🏻</button>
                <button class="btn btn-danger" data-action="delete">X</button>
            </div>
        </div>
        `;
    } else if (item.type === 'video') {
        el.innerHTML = `
        <div class="card">
            <div class="embed-responsive embed-responsive-16by9">
                 <iframe class="embed-responsive-item" src="${item.content}"></iframe>
            </div>
            <div class="card-body">
                <button class="btn btn-primary" data-action="like">👍🏼 ${item.likes}</button>
                <button class="btn btn-secondary" data-action="dislike">👎🏻</button>
                <button class="btn btn-danger" data-action="delete">X</button>
            </div>
        </div>
        `;
    } else if (item.type === 'audio') {
        el.innerHTML = `
        <div class="card">
            <div class="card-img-top">
                <audio src="${item.content}" controls></audio>
            </div>
            <div class="card-body">
                <button class="btn btn-primary" data-action="like">👍🏼 ${item.likes}</button>
                <button class="btn btn-secondary" data-action="dislike">👎🏻</button>
                <button class="btn btn-danger" data-action="delete">X</button>
            </div>
        </div>
        `;
    }
    el.querySelector('[data-action=like]').addEventListener('click', (e)=>{
        fetch(`${baseUrl}/posts/${item.id}/likes`, {
            method: 'POST'
        }).then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            },
        ).then(
            data => {
                el.querySelector('[data-action=like]').textContent=`👍🏼 ${data}`;
            }
        ).catch(error => {
            console.log(error);
        })
    });

    el.querySelector('[data-action=dislike]').addEventListener('click', (e)=>{
        fetch(`${baseUrl}/posts/${item.id}/likes/`, {
                method: 'DELETE'
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
                return response.json();
            },
            ).then(data => {
                el.querySelector('[data-action=like]').textContent=`👍🏼 ${data}`;
            }
            ).catch(error => {
                console.log(error);
            })
        
    });


    el.querySelector('[data-action=delete]').addEventListener('click', (e)=>{
        fetch(`${baseUrl}/posts/${item.id}`, {
            method: 'DELETE'
        }).then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
            },
        ).catch(error => {
            console.log(error);
        });
        postsEl.removeChild(el);
    });
    return el;
    
};


setInterval(() => {
    fetch(`${baseUrl}/posts/poll/${firstSeenId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                return response.text();
            }
        ).then(data => {
            if (data === 'false') {
                return;
            }
            newPostsBtn.style.display = "block";
        }).catch(error => {
            console.log(error);
        });

}, 5000)