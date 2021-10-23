class CommentWidget{
    constructor() {
        this.commentCount = 0;
        this.init();
    }

    createTextView(id,operationType,oldComment) {
        const div = document.createElement('div');
        div.setAttribute('data-parent-id', id);
        div.innerHTML = `<input type="text" value="${operationType === 'Update Comment' ? oldComment : ''}" /><button>${operationType}</button>`;
        return div;
    }

    addChildrenComment(allComments,newComment) {
        allComments.forEach((comment) => {
            if(comment.commentId === newComment.parentCommentId) {
                comment.childComments.push(newComment);
            } else if(comment.childComments.length > 0) {
                this.addChildrenComment(comment.childComments, newComment);
            }
        })
    }

    setAllCommentsToStorage(allComments) {
        localStorage.setItem("commentslist", JSON.stringify(allComments))
    }

    updateLikesOnComments(allComments,parentId){
        for(let comment of allComments) {
            if(comment.commentId === parentId) {
                comment.likes++;
                return;
            } else if(comment.childComments.length > 0) {
                this.updateLikesOnComments(comment.childComments, parentId)
            }
        }
    }

    updateOnComments(allComments,parentId,updateCommentValue) {
        for(let comment of allComments) {
            if(comment.commentId === parentId) {
                comment.commentText = updateCommentValue;
            } else if(comment.childComments.length > 0) {
                this.updateOnComments(comment.childComments, parentId, updateCommentValue)
            }
        }
    } 

    deleteComment(allComments, parentId) {
        for(let comment in allComments) {
            console.log(typeof comment)
            if(allComments[comment].commentId === parentId) {
               //delete comment;
               allComments.splice(comment, 1);
            } else if(allComments[comment].childComments.length > 0) {
                this.deleteComment(allComments[comment].childComments, parentId)
            }
        }
    }

    handleCommentClick(event) {
        console.log(event.target.innerHTML)
        if(event.target.innerHTML === 'Reply') {
            const parentId = !event.target.parentElement.dataset.parentId ? event.target.parentElement.dataset.parentId : event.target.parentElement.id;
            const parentNodeComment = event.target.parentNode;
            parentNodeComment.appendChild(this.createTextView(parentId, 'Add Comment'));
            event.target.style.display = 'none';
            event.target.nextSibling.style.display = 'none';
        } else if(event.target.innerHTML === 'Add Comment') {
            const parentId = event.target.parentElement.dataset.parentId ? event.target.parentElement.dataset.parentId : event.target.parentElement.id;
            const newAddedComment = {
                parentCommentId: parentId,
                commentId: Math.random().toString().substr(2, 7),
                commentText: event.target.parentNode.firstChild.value,
                childComments: [],
                likes: 0
            };
            console.log(newAddedComment)
            const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
            console.log(getCommentsFromStorage);
            this.addChildrenComment(getCommentsFromStorage,newAddedComment);
            console.log(getCommentsFromStorage);
            this.setAllCommentsToStorage(getCommentsFromStorage)
            this.renderView();
        } else if(event.target.innerHTML === 'Likes') {
            const parentId = event.target.parentElement.id;
            const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
            this.updateLikesOnComments(getCommentsFromStorage, parentId)
            this.setAllCommentsToStorage(getCommentsFromStorage);
            this.renderView();
        } else if(event.target.innerHTML === 'Edit') {
            const parentId = !event.target.parentElement.dataset.parentId ? event.target.parentElement.dataset.parentId : event.target.parentElement.id;
            const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
            console.log(getCommentsFromStorage)
            const oldCommentValue = event.target.parentNode.innerText.split(' ')[0];
            const parentNodeComment = event.target.parentNode;
            parentNodeComment.appendChild(this.createTextView(parentId,'Update Comment',oldCommentValue));
        } else if(event.target.innerHTML === 'Update Comment') {
            const parentId = event.target.parentElement.dataset.parentId ? event.target.parentElement.dataset.parentId : event.target.parentElement.id;
            const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
            console.log(getCommentsFromStorage)
            const updateCommentValue = event.target.parentNode.firstChild.value;
            this.updateOnComments(getCommentsFromStorage,parentId,updateCommentValue);
            this.setAllCommentsToStorage(getCommentsFromStorage);
            this.renderView();
        }else if(event.target.innerHTML === 'Delete') {
            const parentId = event.target.parentElement.id;
            const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
            this.deleteComment(getCommentsFromStorage,parentId)
            this.setAllCommentsToStorage(getCommentsFromStorage);
            this.renderView();
        }
    }

    createListView({parentCommentId,commentId,likes,commentText,childComments},padding) {
        return `<div data-parent-id="${parentCommentId}" id="${commentId}" style="padding: 6px;padding-left:${padding}px">
            ${commentText}
            <a href="#">Likes</a><span>${likes === 0 ? " " : likes}</span>
            <a href="#">Reply</a><span>${childComments.length ===0 ? " " : childComments.length}</span>
            <a href="#">Edit</a>
            <a href="#">Delete</a>
        </div>`
    }

    createRecursiveView(comments,padding = 0) {
        let list = "";
        for(let val of comments) {
            list += this.createListView(val,padding);
            if(val.childComments.length > 0) {
                list+=this.createRecursiveView(val.childComments, padding +=20);
                padding-=20;
            }
        }
       return list;
    }

    renderView() {
        const getCommentsFromStorage = JSON.parse(localStorage.getItem("commentslist"));
        if(getCommentsFromStorage) {
            let allComments = this.createRecursiveView(getCommentsFromStorage);
            this.postContainer.innerHTML = allComments;
        }
    }

    submitHandler(event) {
        event.preventDefault();
        const commentBox = this.form.elements["textarea"].value;
        let comments = [];
        if(!localStorage.getItem("commentslist")) {
            localStorage.setItem("commentslist", JSON.stringify(comments));
        }
        comments = JSON.parse(localStorage.getItem("commentslist"));
        comments.push({
            parentCommentId: null,
            commentId: Math.random().toString().substr(2, 7),
            commentText: commentBox,
            childComments: [],
            likes: 0
        });
        localStorage.setItem("commentslist", JSON.stringify(comments));
        this.renderView();
        this.comment.value = '';
    }

    init() {
        this.commentLists = [];
        this.isVisited = false;
        this.form  = document.getElementById('comment-widget');
        this.comment = document.querySelector('#comment');
        this.btn = document.querySelector('#btn');
        this.postContainer = document.querySelector('#post-container');
        this.form.addEventListener('submit', this.submitHandler.bind(this));
        this.postContainer.addEventListener('click', this.handleCommentClick.bind(this))
    }
}

const c1 = new CommentWidget();
c1.renderView();