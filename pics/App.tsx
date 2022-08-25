// Step 0:
// a) get the URL to a Firebase Storage bucket
// b) use the URL in an HTML <img>
import type { Component } from 'solid-js';
import { createResource } from 'solid-js';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore/lite';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp, firebaseConfig.storage);

async function getPicList() {
  // Each document in the "pics" collection has a "bucket".
  const docs = await getDocs(collection(firebaseDb, 'pics'));
  return Promise.all(docs.docs.map(doc =>
      getDownloadURL(ref(storage, doc.data().bucket))));
}

const App: Component = () => {
  const [pics] = createResource(getPicList);
  return (
   <>
     <div>{pics.loading && "Loading..."}</div>
     <div>
       <For each={pics()}>{(pic, i) =>
         <img src={pic} />
       }</For>
     </div>
   </>
  );
};

export default App;
