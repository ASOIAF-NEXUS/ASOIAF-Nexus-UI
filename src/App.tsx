import "@mantine/core/styles.css";
import "./App.css";
import UnitChooser from "./components/ListBuilder.tsx";
import { ReactNode, useCallback, useState } from "react";
import { Modal, Button, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataLoader, SongData } from "./utils.ts";
import { usePrefetchQuery, useQuery } from "@tanstack/react-query";

type LayoutProps = {
  children: ReactNode;
};

function Layout(props: LayoutProps) {
  return (
    <div>
      <div>
        <p>Hello World</p>
      </div>
      {props.children}
    </div>
  );
}

type ListBuilderStepNames = "initial" | "faction" | "builder";

function ListBuilderLanding() {}

function ListBuilder() {
    const { data, isLoading, isError, isPending } = useQuery({
        queryKey: ["DataLoader"],
        queryFn: async () => {
            const loader = new DataLoader()
            return await loader.pLoadJson()
        },
        staleTime: 1000*60*5,
    })

  const [units, setUnits] = useState<SongData[]>([]);
  const [opened, { open, close }] = useDisclosure(false);

  const addUnit = useCallback(
    (newUnit: SongData) => setUnits((x) => [...x, newUnit]),
    [setUnits]
  );

  if (isLoading) {
    console.log("We're loading hell yeah")
    return <LoadingOverlay/>
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title="Unit Chooser">
        <UnitChooser addUnit={addUnit} data={data} />
      </Modal>
      <ul>
        {units.map((u, index) => (
          <li className="list-container" key={index}><span>{u._fullName}</span><span>{u.statistics.tray} <span>{u.statistics.cost}</span></span></li>
        ))}
      </ul>
      <label>Total Cost</label><span>{units.map(u => Number.parseInt(u.statistics.cost)).reduce((acc, val) => acc + val)}</span>

      <Button variant="default" onClick={open}>
        Choose a Unit
      </Button>
    </>
  );
}

function ListBuilderSteps() {
  const [currentStep, setCurrentStep] = useState<ListBuilderStepNames>(
    "initial" as ListBuilderStepNames
  );

  switch (currentStep) {
    case "builder":
      return <ListBuilder />;
    case "initial":
      return (
        <div>
          Go Ahead and Create a new List
          <button onClick={() => {

            setCurrentStep("faction")}
        }>
            I decided to to create a new list
          </button>
        </div>
      );
    case "faction":
      return (
        <div>
          Go ahead and choose the faction
          <button onClick={() => setCurrentStep("builder")}>
            I have chosen a faction
          </button>
        </div>
      );
  }
}

function App() {
  return (
    <Layout>
      <ListBuilderSteps />
    </Layout>
  );
}

export default App;
