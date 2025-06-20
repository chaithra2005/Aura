import React from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const TestFirestore = () => {
  const handleTest = () => {
    addDoc(collection(db, 'cameras'), { test: 'hello' })
      .then(() => alert('Success!'))
      .catch(e => alert('Error: ' + e.message));
  };

  return (
    <button onClick={handleTest}>Test Firestore Write</button>
  );
};

export default TestFirestore;