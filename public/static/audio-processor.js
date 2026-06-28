class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const pcmData = input[0];
            const buffer = new ArrayBuffer(pcmData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < pcmData.length; i++) {
                view.setInt16(i * 2, pcmData[i] * 0x7FFF, true);
            }
            this.port.postMessage(buffer);
        }
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);

