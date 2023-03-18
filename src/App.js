import React, { useRef, useState } from 'react';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import sendSVG from './images/paper-plane.svg';
import anon from './images/anonymous.png';
import logoutSVG from './images/logout.svg';

const firebaseConfig = {
  apiKey: "AIzaSyAx2KnXR8oO259FuWmpEGhAi8wC0HvOI4c",
  authDomain: "chatappforgains.firebaseapp.com",
  projectId: "chatappforgains",
  storageBucket: "chatappforgains.appspot.com",
  messagingSenderId: "104475452845",
  appId: "1:104475452845:web:ca903a1551b32025a36d24"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);


function App() {

  const [user] = useAuthState(auth);

  return (
    <>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(q);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await addDoc(collection(firestore, 'messages'), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });
    console.log("working");
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className='chatroom' onClick={() => dummy}>
      <header>
        <SignOut />
      </header>
      <div className='scroll-container'>
        <div>
          {messages ? messages.map(msg => <ChatMessage key={msg.id} message={msg} />) : null}
        </div>
        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <div className='inputs'>
          <input value={formValue} onChange={e => setFormValue(e.target.value)} type='text' />
          <button type='submit' className='submit'>
            <img src={sendSVG} />
          </button>
        </div>
      </form>
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  const anonymousSignIn = async () => {
    signInAnonymously(auth);
  }
  return (
    <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <button onClick={anonymousSignIn}>Sign in Anonymously</button>
    </>
  )
}

function SignOut() {
  return (
    <button onClick={() => signOut(auth)} className="signout-btn">
      <img src={logoutSVG} />
    </button>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL ? photoURL : anon} className="message-img" />
      <div className='message-wrapper'>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default App;
