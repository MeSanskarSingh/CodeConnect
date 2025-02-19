import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-20X3u98KRFnhmES4IrPIdTN9wxuM_vk",
    authDomain: "codeconnect-40e7c.firebaseapp.com",
    projectId: "codeconnect-40e7c",
    storageBucket: "codeconnect-40e7c.appspot.com",
    messagingSenderId: "810631777812",
    appId: "1:810631777812:web:b41f5c46bb4ec74313a101",
    measurementId: "G-Z9PCD3TG5C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const threadsContainer = document.getElementById("threads");
const newPostBtn = document.getElementById("new-post");
const logoutBtn = document.getElementById("logout");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html"; 
    }
});

async function loadDiscussions() {
    const discussionsQuery = query(collection(db, "discussions"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(discussionsQuery);

    threadsContainer.innerHTML = "";

    querySnapshot.forEach((docSnapshot) => {
        const discussion = docSnapshot.data();
        const discussionId = docSnapshot.id;
        const discussionDiv = document.createElement("div");
        discussionDiv.classList.add("discussion");

        discussionDiv.innerHTML = `
            <h3>${discussion.title}</h3>
            <p>${discussion.content}</p>
            <p><strong>Posted by:</strong> ${discussion.userEmail}</p>
            <div class="vote-container">
                <button class="upvote" data-id="${discussionId}">⬆️ ${discussion.upvotes?.length || 0}</button>
                <button class="downvote" data-id="${discussionId}">⬇️ ${discussion.downvotes?.length || 0}</button>
            </div>
            <div class="comments-section">
                <h4>Comments</h4>
                <div id="comments-${discussionId}" class="comments-list"></div>
                <input type="text" id="comment-input-${discussionId}" class="comment-inputs" placeholder="Write a comment...">
                <button class="comment-btn" data-id="${discussionId}">Post comment</button>
            </div>
        `;

        threadsContainer.appendChild(discussionDiv);

        loadComments(discussionId);
    });

    addVoteEventListeners();
    addCommentEventListeners();
}

async function loadComments(discussionId) {
    const discussionRef = doc(db, "discussions", discussionId);
    const discussionSnap = await getDoc(discussionRef);

    if (discussionSnap.exists()) {
        const discussionData = discussionSnap.data();
        const commentsList = document.getElementById(`comments-${discussionId}`);
        commentsList.innerHTML = "";

        if (discussionData.comments) {
            discussionData.comments.forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");
                commentDiv.innerHTML = `<p><strong>${comment.user}:</strong> ${comment.text}</p>`;
                commentsList.appendChild(commentDiv);
            });
        }
    }
}

function addVoteEventListeners() {
    document.querySelectorAll(".upvote").forEach(button => {
        button.addEventListener("click", async () => {
            const discussionId = button.getAttribute("data-id");
            await handleVote(discussionId, "upvote");
        });
    });

    document.querySelectorAll(".downvote").forEach(button => {
        button.addEventListener("click", async () => {
            const discussionId = button.getAttribute("data-id");
            await handleVote(discussionId, "downvote");
        });
    });
}

async function handleVote(discussionId, voteType) {
    const discussionRef = doc(db, "discussions", discussionId);
    const discussionSnap = await getDoc(discussionRef);
    const discussionData = discussionSnap.data();

    if (!discussionData) return;

    const userEmail = auth.currentUser.email;
    let upvotes = discussionData.upvotes || [];
    let downvotes = discussionData.downvotes || [];

    if (voteType === "upvote") {
        if (upvotes.includes(userEmail)) {
            upvotes = upvotes.filter(email => email !== userEmail);
        } else {
            upvotes.push(userEmail);
            downvotes = downvotes.filter(email => email !== userEmail);
        }
    } else if (voteType === "downvote") {
        if (downvotes.includes(userEmail)) {
            downvotes = downvotes.filter(email => email !== userEmail);
        } else {
            downvotes.push(userEmail);
            upvotes = upvotes.filter(email => email !== userEmail);
        }
    }

    await updateDoc(discussionRef, { upvotes, downvotes });
    loadDiscussions();
}

function addCommentEventListeners() {
    document.querySelectorAll(".comment-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const discussionId = button.getAttribute("data-id");
            const commentInput = document.getElementById(`comment-input-${discussionId}`);
            const commentText = commentInput.value.trim();

            if (commentText) {
                await handleComment(discussionId, commentText);
                commentInput.value = "";
            }
        });
    });
}

async function handleComment(discussionId, commentText) {
    const discussionRef = doc(db, "discussions", discussionId);
    await updateDoc(discussionRef, {
        comments: arrayUnion({
            user: auth.currentUser.email,
            text: commentText,
            timestamp: new Date()
        })
    });

    await loadDiscussions();
}

newPostBtn.addEventListener("click", async () => {
    const title = prompt("Enter Discussion Title:");
    const content = prompt("Enter Discussion Content:");

    if (title && content) {
        await addDoc(collection(db, "discussions"), {
            title,
            content,
            userEmail: auth.currentUser.email,
            timestamp: new Date(),
            upvotes: [],
            downvotes: [],
            comments: []
        });

        loadDiscussions();
    }
});

logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
});

loadDiscussions();
