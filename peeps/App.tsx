// Step 0:
// a) query a Firebase Database
// b) use Solid's createResource to make the async FB DB call
// c) use Solid's <For> to iterate over the list returned by the db query
// d) use Solid's Component for a very simple component
// e) pass values from parent to child component using props
// Step 2:
// a) get a given Firebase doc from its id
// b) use a signal to parameterize calling a resource fetcher

import type { Component } from 'solid-js';
import { createResource, createSignal } from 'solid-js';

import { initializeApp } from "firebase/app";
import { doc, getFirestore, collection, getDoc, getDocs, query, orderBy } from 'firebase/firestore/lite';

import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);

async function getAllThePeeps() {
  const peeps = collection(firebaseDb, 'peeps');
  const docs = await getDocs(peeps);
  return docs.docs.map(doc => doc.data());
}

async function getPeepsByYear() {
  const peeps = collection(firebaseDb, 'peeps');
  const q = query(peeps, orderBy("born.year", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

async function fetchFirstName(peepId) {
  const snap = await getDoc(doc(firebaseDb, 'peeps', peepId));
  return snap.exists() ? snap.data().first : "unknown";
}

// To use the fatherId/motherId property as an argument to fetchFirstName
// these need corresponding signals.
const Peep: Component = (props) => {
  const [getFatherId] = createSignal(props.fatherId);
  const [getFatherName] = createResource(getFatherId, fetchFirstName);
  const [getMotherId] = createSignal(props.motherId);
  const [getMotherName] = createResource(getMotherId, fetchFirstName);
  return (
    <div>{props.first}; Born: {props.yearBorn}; Father: {getFatherName()}; Mother: {getMotherName()}</div>
  );
}

// This presumes a list of objects that each have "first", "fatherId",
// "motherId" and "born" fields.
const App: Component = () => {
  const [peeps] = createResource(getPeepsByYear);
  return (
    <>
      <div>{peeps.loading && "Loading..."}</div>
      <div>
        <For each={peeps()}>{(peep, i) =>
          <Peep
              first={peep.first}
              yearBorn={peep.born.year}
              fatherId={peep.fatherId}
              motherId={peep.motherId} />
        }</For>
      </div>
    </>
  );
};

export default App;
