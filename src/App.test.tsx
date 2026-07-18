import "@testing-library/jest-dom";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

it("renders without crashing", () => {
  render(<App />);
});

it("Sets name for Badminton Mode", () => {
  render(<App />);
  expect(screen.getByText("Badminton Game")).toBeInTheDocument();
});

it("Sets name for Hockey Mode", () => {
  const periodName = "banana";
  vi.stubEnv("VITE_BadmintonMode", "false");
  vi.stubEnv("VITE_PeriodName", periodName);
  render(<App />);
  const period = screen.getByTestId("periodName");
  expect(period).toHaveTextContent(periodName);
});

it("Sets name for Badminton Mode with custom period", () => {
  const periodName = "radish";
  vi.stubEnv("VITE_BadmintonMode", "true");
  vi.stubEnv("VITE_PeriodName", periodName);
  render(<App />);
  const period = screen.getByTestId("periodName");
  expect(period).toHaveTextContent(`Badminton ${periodName}`);
});

it("Flyers - starts as zero", () => {
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("0");
});

it("Flyers + Increases correct shot counter", () => {
  render(<App />);
  const container = document.querySelector(".Zone") as HTMLElement;
  const upButton = within(container).getByRole("button", { name: "+" });
  const boxScoreFlyers = document.querySelector("div.flyers");

  expect(boxScoreFlyers).toHaveTextContent("0");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("1");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("2");
  fireEvent.click(upButton);
  expect(boxScoreFlyers).toHaveTextContent("3");
});

it("Flyers - starts a new test as zero", () => {
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("0");
});

it("Flyers - can initialize a new test as 99", () => {
  window.localStorage.setItem("gameState", JSON.stringify({ game: [{ flyers: 99 }] }));
  render(<App />);
  const boxScoreFlyers = document.querySelector("div.flyers");
  expect(boxScoreFlyers).toHaveTextContent("99");
});

it("BadGuys - can initialize a new test as 99", () => {
  window.localStorage.setItem("gameState", JSON.stringify({ game: [{ badGuys: 99 }] }));
  render(<App />);
  const boxScoreBadGuys = document.querySelector("div.badGuys");
  expect(boxScoreBadGuys).toHaveTextContent("99");
});

describe("increase/decrease shot counters", () => {
  it.each([
    [".Zone", "div.flyers"],
    [".Ztwo", "div.badGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1) as HTMLElement;
    const upButton = within(container).getByRole("button", { name: "+" });
    const downButton = within(container).getByRole("button", { name: "-" });
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
    expect(boxScore).toHaveTextContent("0");
  });
});

describe("moves birdie around counters", () => {
  it.each([
    [".Zone", "div.boxScore.bsFlyers"],
    [".Ztwo", "div.boxScore.bsBadGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1) as HTMLElement;
    const upButton = within(container).getByRole("button", { name: "+" });
    fireEvent.click(upButton);
    const boxScore = document.querySelector(selector2);
    expect(boxScore?.querySelector("img")).toBeTruthy();
  });
});

describe("score as words", () => {
  it.each([
    [".Zone", "div.flyers"],
    [".Ztwo", "div.badGuys"],
  ])("matches correct shot counter", (selector1, selector2) => {
    render(<App />);
    const container = document.querySelector(selector1) as HTMLElement;
    const upButton = within(container).getByRole("button", { name: "+" });

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
    const flyersContainer = document.querySelector(".Zone") as HTMLElement;
    const flyersUpButton = within(flyersContainer).getByRole("button", { name: "+" });
    const badGuysContainer = document.querySelector(".Ztwo") as HTMLElement;
    const badGuysUpButton = within(badGuysContainer).getByRole("button", { name: "+" });

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
