// Step 0:
// a) query a Firebase Database
// b) use Solid's createResource to make the async FB DB call
// c) use Solid's <For> to iterate over the list returned by the db query
// d) use Solid's Component for a very simple component
// e) pass values from parent to child component using props

import type { Component } from 'solid-js';
import { createResource } from 'solid-js';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore/lite';

// This is expected to be a "firebaseConfig" as found in the Firebase Console.
// This is expected to be of the form:
// const firebaseConfig = {
//   apiKey: "API_KEY",
//   authDomain: "PROJECT.firebaseapp.com",
//   databaseURL: "https://PROJECT.firebaseio.com",
//   projectId: "PROJECT",
//   storageBucket: "PROJECT.appspot.com",
//   messagingSenderId: "MESSAGING_ID",
//   appId: "APP_ID",
//   measurementId: "MEASUREMENT_ID"
// };
// All items in CAPS are expected to be values from the FB Console.
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);

// Unused code shows how to get all "documents" in the "collection".
async function getAllThePeeps() {
  const docs = await getDocs(collection(firebaseDb, 'peeps'));
  return docs.docs.map(doc => doc.data());
}

// Each FB DB "document" is expected to have a "first" and "born" field.
// The "first" field is expected to be a string.  The "born" field is a map
// which futher is expected to have a "year" field of type number.
// This function queries for all "documents" in the "collection" ordered by
// year ascending.
async function getPeepsByYear() {
  const peeps = collection(firebaseDb, 'peeps');
  const q = query(peeps, orderBy("born.year", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

const Peep: Component = (props) => {
  return (
    <div>{props.yearBorn} {props.name}</div>
  );
}

const App: Component = () => {
  const [peeps] = createResource(getPeepsByYear);
  //const [peeps] = createResource(getAllThePeeps);
  return (
    <>
      <div>{peeps.loading && "Loading..."}</div>
      <div>
        <For each={peeps()}>{(peep, i) =>
          <Peep name={peep.first} yearBorn={peep.born.year}/>
        }</For>
      </div>
    </>
  );
};

export default App;
