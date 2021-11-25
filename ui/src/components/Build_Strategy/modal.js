import React, {useState} from 'react';

import "../index.css";
import Modal from "react-modal";


export default function saveFileModal(props) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="myModal">

      <Modal
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        ariaHideApp={false}
        isOpen={isOpen}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="mymodal"
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
        <div>My modal dialog.</div>
        <button onClick={toggleModal}>Close modal</button>
      </Modal>
    </div>
  );
}

// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//   },
// };

// // Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
// Modal.setAppElement('#root');

// function saveFileModal(props) {
//   let subtitle;

//   function afterOpenModal() {
//     // references are now sync'd and can be accessed.
//     subtitle.style.color = '#f00';
//   }

//   function closeModal() {
//   }

//   return (
//     <div>
//       <Modal
//         shouldCloseOnOverlayClick={true}
//         shouldCloseOnEsc={true}
//         ariaHideApp={false}
//         isOpen={props.openModal}
//         onAfterOpen={afterOpenModal}
//         onRequestClose={closeModal}
//         style={customStyles}
//         contentLabel="Save file"
//       >
//         <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
//         <button onClick={closeModal}>close</button>
//         <div>I am a modal</div>
//         <form>
//           <input />
//           <button>tab navigation</button>
//           <button>stays</button>
//           <button>inside</button>
//           <button>the modal</button>
//         </form>
//       </Modal>
//     </div>
//   );
// }

// export default saveFileModal