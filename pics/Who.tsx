import type { Component } from 'solid-js';
import { createSignal, createResource } from 'solid-js';
import { doc, getDoc } from 'firebase/firestore/lite';
import { firebaseDb } from './Firebase';

async function fetchPeepFirstName(peepId) {
  const docSnap = await getDoc(doc(firebaseDb, 'peeps', peepId));
  return docSnap.data().first;
}

async function fetchFirstNames(who) {
  return Promise.all(who.map(peepId => fetchPeepFirstName(peepId)));
}

export const Who: Component = (props) => {
  const [getWho] = createSignal(props.who);
  const [getFirstNames] = createResource(getWho, fetchFirstNames);
  return (
    <For each={getFirstNames()}>{(first, i) =>
      <div>{first}</div>
    }</For>
  );
};
