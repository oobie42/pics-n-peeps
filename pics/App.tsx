// Step 4:
// a) get the list of pics from the FB DB "pics" collection
// b) each pic has a:
//   i)  FB Storage bucket name ("bucket")
//     1) the bucket name is translated to a URL to use with <img>
//   ii) list of ids for documents in the FB DB "peeps" collection ("who")
//     1) the "peep" document is expected to have a "first" (name) field
import type { Component } from 'solid-js';
import { createSignal, createResource } from 'solid-js';

import { initializeApp } from "firebase/app";
import { doc, getFirestore, collection, getDoc, getDocs, query, orderBy } from 'firebase/firestore/lite';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp, firebaseConfig.storage);

async function fetchPicUrl(bucket) {
  const url = await getDownloadURL(ref(storage, bucket));
  return url;
}

const Image: Component = (props) => {
  const [getBucket] = createSignal(props.bucket);
  const [getPicUrl] = createResource(getBucket, fetchPicUrl);
  return (
    <img src={getPicUrl()} />
  );
};

async function fetchPeepFirstName(peepId) {
  const docSnap = await getDoc(doc(firebaseDb, 'peeps', peepId));
  return docSnap.data().first;
}

async function fetchFirstNames(who) {
  return Promise.all(who.map(peepId => fetchPeepFirstName(peepId)));
}

const Who: Component = (props) => {
  const [getWho] = createSignal(props.who);
  const [getFirstNames] = createResource(getWho, fetchFirstNames);
  return (
    <For each={getFirstNames()}>{(first, i) =>
      <div>{first}</div>
    }</For>
  );
};

async function fetchPicList() {
  const docs = await getDocs(collection(firebaseDb, 'pics'));
  return docs.docs.map(doc => doc.data());
}

const App: Component = () => {
  console.log('App');
  const [getPicList] = createResource(fetchPicList);
  return (
   <>
     <div>{getPicList.loading && "Loading..."}</div>
     <div>
       <For each={getPicList()}>{(pic, i) =>
        <>
         <Image bucket={pic.bucket} />
         <Who who={pic.who} />
        </>
       }</For>
     </div>
   </>
  );
};

export default App;
