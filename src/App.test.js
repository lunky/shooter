import "@testing-library/jest-dom";
import { render, screen, fireEvent, getByRole } from "@testing-library/react";
import App from "./App";
afterEach(() => {
  // Reset process.env after each test
  jest.resetModules();
  window.localStorage.clear();
});

it("renders without crashing", () => {
  render(<App />);
});

it("Sets name for Badminton Mode", () => {
  render(<App />);
  expect(screen.getByText("Badminton Game")).toBeInTheDocument();
});

it("Sets name for Hockey Mode", async () => {
  const periodName = "banana";
  process.env = Object.assign(process.env, {
    REACT_APP_BadmintonMode: false,
    REACT_APP_PeriodName: periodName,
  });
  render(<App />);
  const period = screen.getByTestId("periodName");
  expect(period).toHaveTextContent(periodName);
});

it("Sets name for Badminton Mode", async () => {
  const periodName = "radish";
  process.env = Object.assign(process.env, {
    REACT_APP_BadmintonMode: true,
    REACT_APP_PeriodName: periodName,
  });
  render(<App />);
  const period = screen.getByTestId("periodName");
  expect(period).toHaveTextContent(`Badminton ${periodName}`);
});

it("Flyers - starts as zero", async () => {
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("0");
});

it("Flyers + Increases correct shot counter", async () => {
  render(<App />);
  const container = document.querySelector(".one");
  const upButton = getByRole(container, "button", { name: "+" });
  const boxScoreFlyers = document.querySelector("div.flyers");

  expect(boxScoreFlyers).toHaveTextContent("0");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("1");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("2");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("3");
});

it("Flyers - starts a new test as zero", async () => {
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("0");
});

it("Flyers - can initialize a new test as 99", async () => {
  window.localStorage.setItem("gameState", JSON.stringify({ game: [{ flyers: 99 }] }));
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("99");
});

it("BadGuys - can initialize a new test as 99", async () => {
  window.localStorage.setItem("gameState", JSON.stringify({ game: [{ badGuys: 99 }] }));
  render(<App />);
  const boxScoreBadGuys = document.querySelector("div.badGuys");
  expect(boxScoreBadGuys).toHaveTextContent("99");
});

describe("increase/decrease shot counters", () => {
  it.each([
    [".one", "div.flyers"],
    [".two", "div.badGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1);
    const upButton = getByRole(container, "button", { name: "+" });
    const downButton = getByRole(container, "button", { name: "-" });
    const boxScore = document.querySelector(selector2);

    expect(boxScore).toHaveTextContent("0");
    fireEvent.click(upButton);
    expect(boxScore).toHaveTextContent("1");
    fireEvent.click(upButton);
    expect(boxScore).toHaveTextContent("2");
    fireEvent.click(upButton);
    expect(boxScore).toHaveTextContent("3");
    fireEvent.click(downButton);
    expect(boxScore).toHaveTextContent("2");
    fireEvent.click(downButton);
    expect(boxScore).toHaveTextContent("1");
    fireEvent.click(downButton);
    expect(boxScore).toHaveTextContent("0");
    fireEvent.click(downButton);
    expect(boxScore).toHaveTextContent("0"); // still zero
  });
});

describe("moves birdie around counters", () => {
  it.each([
    [".one", "div.boxScore.bsFlyers"],
    [".two", "div.boxScore.bsBadGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1);
    const upButton = getByRole(container, "button", { name: "+" });
    fireEvent.click(upButton);
    const boxScore = document.querySelector(selector2);
    expect(boxScore.querySelector("img")).toBeTruthy();
  });
});

describe("score as words", () => {
  it.each([
    [".one", "div.flyers"],
    [".two", "div.badGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1);
    const upButton = getByRole(container, "button", { name: "+" });

    const scoreInWords = document.querySelector("div.boxScoreInWords");
    expect(scoreInWords).toHaveTextContent("0 serving 0");
    fireEvent.click(upButton);
    expect(scoreInWords).toHaveTextContent("1 serving 0");
    fireEvent.click(upButton);
    expect(scoreInWords).toHaveTextContent("2 serving 0");
    fireEvent.click(upButton);
    expect(scoreInWords).toHaveTextContent("3 serving 0");
  });
  it("keeps correct shot counter", () => {
    render(<App />);
    const flyersContainer = document.querySelector(".one");
    const flyersUpButton = getByRole(flyersContainer, "button", { name: "+" });
    const badGuysContainer = document.querySelector(".two");
    const badGuysUpButton = getByRole(badGuysContainer, "button", { name: "+" });

    const scoreInWords = document.querySelector("div.boxScoreInWords");
    expect(scoreInWords).toHaveTextContent("0 serving 0");
    fireEvent.click(flyersUpButton);
    expect(scoreInWords).toHaveTextContent("1 serving 0");
    fireEvent.click(badGuysUpButton);
    expect(scoreInWords).toHaveTextContent("1 serving 1");
    fireEvent.click(badGuysUpButton);
    expect(scoreInWords).toHaveTextContent("2 serving 1");
    fireEvent.click(flyersUpButton);
    expect(scoreInWords).toHaveTextContent("2 serving 2");
  });
});
