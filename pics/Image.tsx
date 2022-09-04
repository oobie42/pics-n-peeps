import type { Component } from 'solid-js';
import { createSignal, createResource } from 'solid-js';

import { ref, getDownloadURL } from "firebase/storage";

import { firebaseStorage } from './Firebase';

async function fetchPicUrl(bucket) {
  const url = await getDownloadURL(ref(firebaseStorage, bucket));
  return url;
}

export const Image: Component = (props) => {
  const [getBucket] = createSignal(props.bucket);
  const [getPicUrl] = createResource(getBucket, fetchPicUrl);
  return (
    <img src={getPicUrl()} />
  );
};
