import React, { useEffect, useRef, useState } from 'react'
import { initFunc } from '../../three'
import styles from './SolarSystem.module.scss'
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,.001)',
        backdropFilter: "blur(6px)",
    }
};

const SolarSystem = () => {
    const canvaContainer = useRef(null);
    const [clickHander, setClickHandler] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const addNote = useRef(null);
    const [data, setData] = useState({
        note: '',
        addTo: 'sun',
        color: "#00ff00",
        size: 5,
        height: 1,
        x: 0,
        y: 100,
        z: 0
    });

    const onFormDataChange = e => {
        setData(p => ({ ...p, [e.target.id]: e.target.value }));
    }

    const handleFormSubmit = e => {
        e.preventDefault();
        addNote.current({ ...data })
        setData({
            note: '',
            addTo: 'sun',
            color: "#00ff00",
            size: 5,
            height: 1,
            x: 0,
            y: 100,
            z: 0
        });

        setModalIsOpen(false);
        const tempEvent = { target: { id: 'front' } }
        clickHander(tempEvent)
    }

    useEffect(() => {
        if (!canvaContainer.current) return;

        const { changeView, addNote: addNoteFunc } = initFunc({
            canvaContainer
        });

        setClickHandler(() => changeView);
        addNote.current = addNoteFunc;
    }, [canvaContainer])
    return (
        <>
            <div ref={canvaContainer} className={styles.canvaContainer}></div>
            <div className={styles.buttons}>
                <button onClick={clickHander} id='top'>Top View</button>
                <button onClick={clickHander} id='front'>Front View</button>
                <button onClick={clickHander} id='side'>Side View</button>
                <button onClick={() => setModalIsOpen(true)}>Add Note</button>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={customStyles}
            >
                <form className={styles.modalForm} onSubmit={handleFormSubmit}>
                    <div>
                        <label htmlFor="note">Note</label>
                        <input required type="text" id='note' onChange={onFormDataChange} value={data.note} />
                    </div>
                    <div>
                        <label htmlFor="color">Color</label>
                        <input required type="color" id='color' onChange={onFormDataChange} value={data.color} />
                    </div>
                    <div>
                        <label htmlFor="size">Size</label>
                        <input required min="1" max="10" step="1" type="number" id='size' onChange={onFormDataChange} value={data.size} />
                    </div>
                    <div>
                        <label htmlFor="height">Depth</label>
                        <input required min="1" max="3" step="1" type="number" id='height' onChange={onFormDataChange} value={data.height} />
                    </div>
                    <div>
                        <label htmlFor="addTo">Add To</label>
                        <select required id="addTo" onChange={onFormDataChange} value={data.addTo}>
                            <option value="sun">Top of Sun</option>
                            <option value="mercury">Top of Mercury</option>
                            <option value="venus">Top of Venus</option>
                            <option value="earth">Top of Earth</option>
                            <option value="mars">Top of Mars</option>
                            <option value="jupiter">Top of Jupiter</option>
                            <option value="saturn">Top of Saturn</option>
                            <option value="uranus">Top of Uranus</option>
                            <option value="neptune">Top of Neptune</option>
                            <option value="pluto">Top of pluto</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    {
                        data.addTo === "custom" && (
                            <>
                                <div>
                                    <label htmlFor="x">X</label>
                                    <input required={data.addTo === 'custom'} onChange={onFormDataChange} value={data.x} id='x' type="number" step="0.001" min="-200" max="200" />
                                </div>
                                <div>
                                    <label htmlFor="y">Y</label>
                                    <input required={data.addTo === 'custom'} onChange={onFormDataChange} value={data.y} id='y' type="number" step="0.001" min="-200" max="200" />
                                </div>
                                <div>
                                    <label htmlFor="z">Z</label>
                                    <input required={data.addTo === 'custom'} onChange={onFormDataChange} value={data.z} id='z' type="number" step="0.001" min="-200" max="200" />
                                </div>
                            </>
                        )
                    }
                    <input type="submit" value="Add Note" />
                </form>
            </Modal>
        </>
    )
}

export default SolarSystem