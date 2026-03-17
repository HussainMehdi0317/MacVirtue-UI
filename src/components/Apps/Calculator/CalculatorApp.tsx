import React from "react";

type Operator = "+" | "-" | "*" | "/" | null;

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = React.useState("0");
  const [accumulator, setAccumulator] = React.useState<number | null>(null);
  const [operator, setOperator] = React.useState<Operator>(null);
  const [overwrite, setOverwrite] = React.useState(false);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (overwrite || prev === "0") {
        setOverwrite(false);
        return digit;
      }
      return prev + digit;
    });
  };

  const inputDot = () => {
    setDisplay((prev) => {
      if (overwrite) {
        setOverwrite(false);
        return "0.";
      }
      if (prev.includes(".")) return prev;
      return prev + ".";
    });
  };

  const clearAll = () => {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setOverwrite(false);
  };

  const clearEntry = () => {
    setDisplay("0");
    setOverwrite(true);
  };

  const toggleSign = () => {
    setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
  };

  const percent = () => {
    setDisplay((prev) => String(parseFloat(prev || "0") / 100));
    setOverwrite(true);
  };

  const applyPending = (next: number): number => {
    if (accumulator == null || operator == null) return next;
    switch (operator) {
      case "+":
        return accumulator + next;
      case "-":
        return accumulator - next;
      case "*":
        return accumulator * next;
      case "/":
        return next === 0 ? accumulator : accumulator / next;
      default:
        return next;
    }
  };

  const chooseOperator = (op: Exclude<Operator, null>) => {
    const current = parseFloat(display || "0");
    if (accumulator == null) {
      setAccumulator(current);
    } else if (!overwrite) {
      const result = applyPending(current);
      setAccumulator(result);
      setDisplay(String(result));
    }
    setOperator(op);
    setOverwrite(true);
  };

  const equals = () => {
    const current = parseFloat(display || "0");
    const result = applyPending(current);
    setDisplay(String(result));
    setAccumulator(null);
    setOperator(null);
    setOverwrite(true);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950/80 text-slate-100">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 pt-4 pb-3 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="text-xs text-slate-400 mb-1">Calculator</div>
          <div className="text-right text-3xl font-light tabular-nums break-all">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-2 text-sm">
          <button className="py-2 rounded-full bg-slate-800 text-amber-300" onClick={clearAll}>
            AC
          </button>
          <button className="py-2 rounded-full bg-slate-800" onClick={clearEntry}>
            C
          </button>
          <button className="py-2 rounded-full bg-slate-800" onClick={toggleSign}>
            ±
          </button>
          <button className="py-2 rounded-full bg-amber-500 text-black" onClick={() => chooseOperator("/")}>
            ÷
          </button>

          {["7", "8", "9"].map((d) => (
            <button
              key={d}
              className="py-2 rounded-full bg-slate-700"
              onClick={() => inputDigit(d)}
            >
              {d}
            </button>
          ))}
          <button className="py-2 rounded-full bg-amber-500 text-black" onClick={() => chooseOperator("*")}>
            ×
          </button>

          {["4", "5", "6"].map((d) => (
            <button
              key={d}
              className="py-2 rounded-full bg-slate-700"
              onClick={() => inputDigit(d)}
            >
              {d}
            </button>
          ))}
          <button className="py-2 rounded-full bg-amber-500 text-black" onClick={() => chooseOperator("-")}>
            −
          </button>

          {["1", "2", "3"].map((d) => (
            <button
              key={d}
              className="py-2 rounded-full bg-slate-700"
              onClick={() => inputDigit(d)}
            >
              {d}
            </button>
          ))}
          <button className="py-2 rounded-full bg-amber-500 text-black" onClick={() => chooseOperator("+")}>
            +
          </button>

          <button
            className="py-2 rounded-full bg-slate-700 col-span-2"
            onClick={() => inputDigit("0")}
          >
            0
          </button>
          <button className="py-2 rounded-full bg-slate-700" onClick={inputDot}>
            .
          </button>
          <button className="py-2 rounded-full bg-amber-400 text-black" onClick={equals}>
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorApp;
