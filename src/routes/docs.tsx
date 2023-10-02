// Adapted from: https://blog.logrocket.com/build-google-docs-clone-react-automerge/
import { useLoaderData, useNavigate } from "react-router-dom";
import { DocumentsType, rootDoc, setDocChangeHook, unsetDocChangeHook } from "../utils/main";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "../components/docs/header";
import ContentWrapper from "../components/docs/content-wrapper";
import DocumentCard from "../components/docs/document-card";
import AddButton from "../components/docs/add-button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Docs() {
  const navigate = useNavigate()
  const docId = useLoaderData() as string || '';
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [docsVal, setDocsVal] = useState<DocumentsType>({});

  const addDocument = () => {
    const id = uuidv4();
    rootDoc.change(docs => {
      docs[id] = {
        docId: id,
        text: editorValue,
      }
      navigate(`/docs/${id}`);
    });
  };

  const loadDocument = useCallback(() => {
    rootDoc.doc()
      .then(docs => {
        setDocsVal(docs || {})
        if (docId) {
          if (docs && docs[docId]) {
            const item = docs[docId]
            setEditorValue(item.text)
            // Note the order: editorValue is a trigger to updateDocument
            setEditorVisible(true)
          } else {
            navigate("/docs")
            setEditorVisible(false)
          }
        }
      })
      .catch((err) => console.log(err))
  }, [docId, navigate]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const deleteDocument = (docId: string) => {
    rootDoc.change(docs => {
      delete docs[docId]
    })
  };

  useEffect(() => {
    setDocChangeHook(docs => {
      setDocsVal(docs)
        if (docId) {
          setEditorValue(docs[docId].text || '')
        }
    })
    return () => unsetDocChangeHook()
  }, [docId]);

  // The following code does not work. Don't know why
  // const updateDocument = useCallback(() => {
  //   // Do not set the document to empty when loading
  //   if (docId && editorVisible) {
  //     rootDoc.change(docs => {
  //       docs[docId].text = editorValue
  //     })
  //   }
  // }, [docId, editorValue, editorVisible])

  // useEffect(() => {
  //   updateDocument();
  // }, [updateDocument]);

  const updateDocument = (val: string) => {
    if (docId && editorVisible) {
      rootDoc.change(docs => {
        docs[docId].text = val
      })
    }
    setEditorValue(val)
  }

  return (
    <div className="wrapper">
      <Header
        onClick={() => {
          setEditorVisible(false);
          navigate("/docs");
        }}
      />
      {!editorVisible ? (
        <ContentWrapper>
          {Object.keys(docsVal).map((keyId, index) => {
              return (
                <DocumentCard
                  key={index}
                  text={docsVal[keyId].text}
                  onClick={() => {
                    setEditorVisible(true);
                    navigate(`/docs/${keyId}`);
                  }}
                  deleteHandler={(e) => {
                    e.stopPropagation();
                    deleteDocument(keyId);
                  }}
                />
              );
            })}
          <AddButton
            onClick={() => {
              setEditorVisible(true);
              addDocument();
            }}
          />
        </ContentWrapper>
      ) : (
        <ReactQuill
          theme="snow"
          value={editorValue}
          // onChange={setEditorValue}
          onChange={updateDocument}
        />
      )}
    </div>
  )
}
