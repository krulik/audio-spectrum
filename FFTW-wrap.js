let fftw_plan_dft_r2c_1d;
let fftw_execute;
let fftw_destroy_plan;
let FFTW_ESTIMATE = (1 << 6);
let fft = FFTWModule().then(function() {
    fftw_plan_dft_r2c_1d = fft.cwrap('fftw_plan_dft_r2c_1d', 'number', ['number', 'number', 'number', 'number']);
    fftw_execute = fft.cwrap('fftw_execute', 'void', ['number']);
    fftw_destroy_plan = fft.cwrap('fftw_destroy_plan', 'void', ['number']);
});
let doFFT = function(doubles, freq) {
    let src_ptr = fft._malloc(doubles.length * Float64Array.BYTES_PER_ELEMENT);
    let dst_ptr = fft._malloc(2 * (doubles.length / 2 + 1) * Float64Array.BYTES_PER_ELEMENT);
    let src = new Float64Array(fft.HEAPF64.buffer, src_ptr, doubles.length);
    let dst = new Float64Array(fft.HEAPF64.buffer, dst_ptr, doubles.length * 2);
    src.set(doubles);
    let plan = fftw_plan_dft_r2c_1d(doubles.length, src_ptr, dst_ptr, FFTW_ESTIMATE);
    fftw_execute(plan);
    fftw_destroy_plan(plan);
    fftdata = new Array(2);
    fftdata[0] = new Array(doubles.length / 2 + 1);
    fftdata[1] = new Array(doubles.length / 2 + 1);
    let result = [];
    let T = doubles.length / freq;
    for (let i = 0; i < doubles.length + 2; i += 2) {
        let val = Math.hypot(dst[i], dst[i + 1]) / (doubles.length / 2);
        let freq = i / 2 / T;
        fftdata[0][i / 2] = freq;
        fftdata[1][i / 2] = val;
        result.push([freq, val]);
    }
    fft._free(src_ptr);
    fft._free(dst_ptr);
    return result;
}