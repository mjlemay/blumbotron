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
    <main className="flex flex-col min-h-screen bg-slate-800">
      <Header />
      <div className="flex-1 flex items-center h-[calc(100vh-80px)] justify-center">
        {showView(view)}
      </div>
    </main>
  );
}

export default MainViewer;
