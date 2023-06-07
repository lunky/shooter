import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('demonstrates that the test runner is working', ()=> {
  const a = 2;
  const b = 3;
  const total = a + b;
  expect(total).toBe(5);
})