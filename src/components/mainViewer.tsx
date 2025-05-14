import { useState } from "react";
import ViewHome from "./viewHome";
import ViewForm from "./viewForm";
import Header from "./header";

function MainViewer() {
  const [ view ] = useState("home");

  const showView = (view: string) => {
    let selectedView = <></>;
    switch (view) {
      case "home":
        selectedView = <ViewHome />;
        break;
      case "form":
        selectedView = <ViewForm />;
        break;
      default:
        selectedView = <ViewHome />;
        break;
    }
    return selectedView;
  }
  return (
    <main className="text-white">
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex items-center justify-center h-full bg-slate-800 max-w-screen">
          {showView(view)}
        </div>
      </div>
    </main>
  );
}

export default MainViewer;
