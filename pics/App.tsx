// Step 5:
// a) paginate through the FB DB "pics" collection
//   i) createSignal for the pagination token
//   ii) pass the pagination signal to the resource fetcher
//   iii) save off the last document for use as the pagination token
//   iv) iterate (map) over the resource list to create Img+Who components
//   v) next handler sets the pagination token which triggers a new fetch
// b) each pic has a:
//   i)  FB Storage bucket name ("bucket")
//     1) the bucket name is translated to a URL to use with <img>
//   ii) list of ids for documents in the FB DB "peeps" collection ("who")
//     1) the "peep" document is expected to have a "first" (name) field
import type { Component } from 'solid-js';
import { createSignal, createResource } from 'solid-js';

import { initializeApp } from "firebase/app";
import { doc, getFirestore, collection, getDoc, getDocs, query, orderBy, startAfter, limit } from 'firebase/firestore/lite';
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

async function fetchPicDocs(next) {
  let queryConstraints = [
    collection(firebaseDb, 'pics'),
    orderBy('bucket'),
    limit(2)];
  if (next) {  // "undefined" for the first query
    queryConstraints.push(startAfter(next));
  }
  const snap = await getDocs(query(...queryConstraints));
  return snap.docs;
  // XXX how do know if this is the last page?
}

function page(pics) {
  return (
    <For each={pics}>{(pic, i) =>
      <>
        <Image bucket={pic.bucket} />
        <Who who={pic.who} />
      </>
    }</For>
  );
}

const App: Component = () => {
  const [getLast, setLast] = createSignal(0);
  const [getPicDocs] = createResource(getLast, fetchPicDocs);
  let last;
  const nextHandler = () => {
    setLast(last);  // This triggers another fetch.
  };
  // 1) save off the last doc for use in pagination
  // 2) return the Image+Who components for each picDoc
  const showPage = (picDocs) => {
    if (picDocs == undefined) {  // XXX Why?
      return;
    }
    // Do NOT call setLast here as that will cause an infinite loop.
    last = picDocs[picDocs.length - 1];
    return page(picDocs.map(doc => doc.data()));
  };
  // XXX don't show the next button if we're at the end
  return (
   <>
     <div>{getPicDocs.loading && "Loading..."}</div>
     <div>
       {showPage(getPicDocs())}
       <button onClick={[nextHandler]}>Next</button>
     </div>
   </>
  );
};

export default App;
