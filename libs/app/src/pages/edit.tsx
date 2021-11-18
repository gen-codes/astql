import { SandpackLayout } from "../common/Layout";
import { SandpackCodeEditor } from "../components/ASTQLI";
import { SandpackProvider } from "../contexts/sandpackContext";

 const Edit = (props) => {
  return (
    <SandpackProvider
      queries={{
        ba: 'asd'
      }}
      customSetup={{
        files: {
          "code/index.js": `hello`,
          "queries/index.js": `hello`
        },
        dependencies: {
          "astql": "0.0.0"
        },
        entry: "code/index.js",

        main: "code/index.js",
        // environment: "parcel",
      }}
    // template={'react'}
    >

      <SandpackLayout theme={props.theme}>
        <SandpackCodeEditor
        />
      </SandpackLayout>

    </SandpackProvider>
  )
}
export default Edit