// Step 6:
// a) paginate through the FB DB "pics" collection
//   i) createSignal for the pagination token
//   ii) pass the pagination signal to the resource fetcher
//   iii) save off the last document for use as the pagination token
//   iv) iterate (map) over the resource list to create Img+Who components
//   v) next handler sets the pagination token which triggers a new fetch
//   vi) back handler pops previous pagination token off the back stack
// b) each pic has a:
//   i)  FB Storage bucket name ("bucket")
//     1) the bucket name is translated to a URL to use with <img>
//   ii) list of ids for documents in the FB DB "peeps" collection ("who")
//     1) the "peep" document is expected to have a "first" (name) field
import type { Component } from 'solid-js';
import { createSignal, createResource } from 'solid-js';
import { doc, collection, getDoc, getDocs, query, orderBy, startAfter, limit } from 'firebase/firestore/lite';
import { ref, getDownloadURL } from "firebase/storage";
import { firebaseDb, firebaseStorage } from './Firebase';
import { Image } from './Image';
import { Who } from './Who';

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

function pushIfNotZero(stack, object) {
  if (object) {
    stack.push(object);
  }
}

const App: Component = () => {
  const [getLast, setLast] = createSignal(0);
  const [getPicDocs] = createResource(getLast, fetchPicDocs);
  let last;
  let backStack = [];
  const nextHandler = () => {
    pushIfNotZero(backStack, getLast());
    setLast(last);  // This triggers another fetch.
  };
  const backHandler = () => {
    setLast(backStack.length ? backStack.pop() : 0);
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
       <button onClick={[backHandler]}>Back</button>
       <button onClick={[nextHandler]}>Next</button>
     </div>
   </>
  );
};

export default App;
